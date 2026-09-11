const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const roomsSnap = await getDocs(collection(db, 'state', 'global', 'rooms'));
  const tenantsSnap = await getDocs(collection(db, 'state', 'global', 'tenants'));
  
  let rooms = [];
  roomsSnap.forEach(d => rooms.push(d.data()));
  
  let tenants = [];
  tenantsSnap.forEach(d => tenants.push(d.data()));
  
  // Actually, wait, the data is in 'state' -> 'global' doc, or collections?
  // Let's check firebase.ts or context.tsx to see how it's fetched.
}
run().catch(console.error);
