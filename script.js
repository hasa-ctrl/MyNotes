// 1. Import sistem Firebase dari internet (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Konfigurasi Firebase Anda (Sesuai dengan screenshot yang Anda kirim)
const firebaseConfig = {
    apiKey: "AIzaSyAng1Bv6vEjbVbupYnVM__T7pJoocZ1XC4",
    authDomain: "mynotes-app-16caf.firebaseapp.com",
    projectId: "mynotes-app-16caf",
    storageBucket: "mynotes-app-16caf.appspot.com",
    messagingSenderId: "778319601992",
    appId: "1:778319601992:web:a5ca63d00fe372ed3c537d",
    measurementId: "G-EN97PLE8XT"
};

// 3. Menyalakan Firebase dan Database (Firestore)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Mengambil elemen dari HTML
const titleInput = document.getElementById('note-title');
const bodyInput = document.getElementById('note-body');
const saveBtn = document.getElementById('save-btn');
const notesContainer = document.getElementById('notes-container');

// 5. Fungsi untuk MENARIK & MENAMPILKAN data secara Real-Time
// Mengurutkan catatan dari yang paling baru
const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    notesContainer.innerHTML = ''; // Kosongkan layar dulu
    
    snapshot.forEach((docSnap) => {
        const note = docSnap.data();
        const noteId = docSnap.id; // ID unik dari Firebase

        const noteElement = document.createElement('div');
        noteElement.classList.add('note-card');

        noteElement.innerHTML = `
            <div>
                <h3>${note.title}</h3>
                <p>${note.body}</p>
            </div>
            <button class="delete-btn" onclick="deleteNote('${noteId}')">Hapus</button>
        `;

        notesContainer.appendChild(noteElement);
    });
});

// 6. Fungsi untuk MENGIRIM catatan baru ke Firebase
async function addNote() {
    const titleValue = titleInput.value.trim();
    const bodyValue = bodyInput.value.trim();

    if (titleValue === '' || bodyValue === '') {
        alert('Judul dan isi catatan tidak boleh kosong!');
        return;
    }

    try {
        // Mengirim data ke koleksi "notes" di Firestore
        await addDoc(collection(db, "notes"), {
            title: titleValue,
            body: bodyValue,
            createdAt: serverTimestamp() // Catat waktu pembuatan
        });

        // Kosongkan form setelah berhasil disimpan
        titleInput.value = '';
        bodyInput.value = '';
    } catch (error) {
        console.error("Gagal menyimpan catatan: ", error);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
}

// 7. Fungsi untuk MENGHAPUS catatan dari Firebase
async function deleteNote(id) {
    try {
        await deleteDoc(doc(db, "notes", id));
    } catch (error) {
        console.error("Gagal menghapus catatan: ", error);
    }
}

// Menyambungkan fungsi hapus ke layar (karena menggunakan type="module")
window.deleteNote = deleteNote;

// Menjalankan fungsi simpan saat tombol diklik
saveBtn.addEventListener('click', addNote);