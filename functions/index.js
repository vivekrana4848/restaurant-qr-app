const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const DB_ORDERS_PATH = 'orders';
const DAYS = 40;

/**
 * Scheduled function to clean up orders older than 40 days.
 * Backs up orders to Firebase Storage as JSON and deletes them from Realtime Database.
 */
exports.cleanupOldOrders = functions
  .pubsub
  .schedule('every 24 hours')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log(`Starting automated cleanup for orders older than ${DAYS} days...`);
      const now = Date.now();
      const cutoff = now - DAYS * 24 * 60 * 60 * 1000;

      const snapshot = await admin.database().ref(DB_ORDERS_PATH).once('value');
      const orders = snapshot.val();

      if (!orders) {
        console.log('No orders found in database. Skipping cleanup.');
        return null;
      }

      const toBackup = {};
      const toDeleteKeys = [];

      Object.entries(orders).forEach(([key, order]) => {
        // Safe check for createdAt timestamp (number, string, or Firestore-style object)
        const createdAt = order && (order.createdAt || order.created_at || order.timestamp);
        let ts = null;

        if (typeof createdAt === 'number') {
          ts = createdAt;
        } else if (typeof createdAt === 'string') {
          const parsed = Date.parse(createdAt);
          if (!isNaN(parsed)) ts = parsed;
        } else if (createdAt && createdAt._seconds) {
          ts = createdAt._seconds * 1000;
        }

        if (ts && ts < cutoff) {
          toBackup[key] = order;
          toDeleteKeys.push(key);
        }
      });

      if (toDeleteKeys.length === 0) {
        console.log(`No orders older than ${DAYS} days found. Database is clean.`);
        return null;
      }

      // 1. Prepare backup file name
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `backups/orders-${timestamp}.json`;
      const bucket = admin.storage().bucket();

      // 2. Upload backup to Firebase Storage
      console.log(`Backing up ${toDeleteKeys.length} orders to: ${filename}`);
      await bucket.file(filename).save(JSON.stringify(toBackup, null, 2), {
        resumable: false,
        contentType: 'application/json',
        metadata: {
          metadata: {
            orderCount: toDeleteKeys.length,
            cleanupDate: new Date().toISOString()
          }
        }
      });

      // 3. Batch delete from Realtime Database
      const updates = {};
      toDeleteKeys.forEach((key) => {
        updates[`${DB_ORDERS_PATH}/${key}`] = null;
      });

      console.log(`Deleting ${toDeleteKeys.length} old orders from database...`);
      await admin.database().ref().update(updates);

      console.log(`Successfully completed cleanup. Deleted ${toDeleteKeys.length} orders. Backup file: ${filename}`);
      return null;
    } catch (error) {
      console.error('CRITICAL: Error during automated data retention process:', error);
      throw new functions.https.HttpsError('internal', 'Automated cleanup failed');
    }
  });
