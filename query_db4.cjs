const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const docSnap = await getDoc(doc(db, 'state', 'global'));
  if (docSnap.exists()) {
    const data = docSnap.data();
    const tenants = data.tenants || [];
    
    const tenant302 = tenants.find(t => t.roomId === 'r5');
    console.log("Tenant for Room 302:", tenant302);
  }
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
