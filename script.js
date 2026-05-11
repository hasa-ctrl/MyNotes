// 1. Import sistem Firebase dan Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 2. Konfigurasi Firebase Anda (PASTIKAN MENGGUNAKAN API KEY ANDA SENDIRI)
const firebaseConfig = {
    apiKey: "AIzaSyAng1Bv6vEjbVbupYnVM__T7pJoocZ1XC4",
    authDomain: "mynotes-app-16caf.firebaseapp.com",
    projectId: "mynotes-app-16caf",
    storageBucket: "mynotes-app-16caf.appspot.com",
    messagingSenderId: "778319601992",
    appId: "1:778319601992:web:a5ca63d00fe372ed3c537d",
    measurementId: "G-EN97PLE8XT"
};

// 3. Menyalakan Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 4. Elemen HTML
const titleInput = document.getElementById('note-title');
const categoryInput = document.getElementById('note-category');
const bodyInput = document.getElementById('note-body');
const saveBtn = document.getElementById('save-btn');
const notesContainer = document.getElementById('notes-container');

// Elemen Auth HTML
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userNameDisplay = document.getElementById('user-name');

let currentUser = null; 
let unsubscribeSnapshot = null; 

// 5. Sistem Pemantau Status Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Jika Berhasil Login
        currentUser = user;
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        userNameDisplay.textContent = `Halo, ${user.displayName}`;
        loadNotes(); // Mulai tarik data
    } else {
        // Jika Logout / Belum Login
        currentUser = null;
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
        if (unsubscribeSnapshot) unsubscribeSnapshot(); // Hentikan aliran data demi keamanan
    }
});

// 6. Tombol Aksi Login & Logout
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => console.error("Error login:", error));
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// 7. Fungsi untuk MENARIK Data Khusus Milik User yang Sedang Login
function loadNotes() {
    // Memfilter data: HANYA ambil data di mana userId sama dengan ID Anda
    const q = query(collection(db, "notes"), where("userId", "==", currentUser.uid));

    unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        notesContainer.innerHTML = ''; 
        
        const notesArray = [];
        snapshot.forEach((docSnap) => {
            notesArray.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Mengurutkan data terbaru di atas menggunakan JavaScript
        notesArray.sort((a, b) => {
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        // Menampilkan ke layar
        notesArray.forEach((note) => {
            const dateStr = note.createdAt ? note.createdAt.toDate().toLocaleString('id-ID') : 'Baru saja';
            const categoryLabel = note.category ? note.category : 'Umum';

            const noteElement = document.createElement('div');
            noteElement.classList.add('note-card');

            noteElement.innerHTML = `
                <div>
                    <span class="badge badge-${categoryLabel}">${categoryLabel}</span>
                    <h3>${note.title}</h3>
                    <p class="note-date">${dateStr}</p>
                    <p>${note.body}</p>
                </div>
                <button class="delete-btn" onclick="deleteNote('${note.id}')">Hapus</button>
            `;
            notesContainer.appendChild(noteElement);
        });
    });
}

// 8. Fungsi Simpan Catatan (Dilengkapi User ID)
async function addNote() {
    const titleValue = titleInput.value.trim();
    const bodyValue = bodyInput.value.trim();

    if (titleValue === '' || bodyValue === '') {
        alert('Judul dan isi catatan tidak boleh kosong!');
        return;
    }

    try {
        await addDoc(collection(db, "notes"), {
            title: titleValue,
            body: bodyValue,
            category: categoryInput.value,
            createdAt: serverTimestamp(),
            userId: currentUser.uid // MENYIMPAN ID PEMILIK CATATAN
        });

        titleInput.value = '';
        bodyInput.value = '';
    } catch (error) {
        console.error("Gagal menyimpan:", error);
    }
}

// 9. Fungsi Hapus Catatan
async function deleteNote(id) {
    try {
        await deleteDoc(doc(db, "notes", id));
    } catch (error) {
        console.error("Gagal menghapus:", error);
    }
}

window.deleteNote = deleteNote;
saveBtn.addEventListener('click', addNote);
