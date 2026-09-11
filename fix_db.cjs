const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const ref = doc(db, 'state', 'global');
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    const data = docSnap.data();
    let tenants = data.tenants || [];
    
    let updated = false;
    tenants = tenants.map(t => {
      if (t.roomId === 'r5') {
        updated = true;
        return { ...t, visaHandled: false, secondaryVisaHandled: false };
      }
      return t;
    });
    
    if (updated) {
      await setDoc(ref, { ...data, tenants });
      console.log("Updated tenant in r5");
    }
  }
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
