import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBRKEC5zRICQvcmlnTcC06qSbiiyDexOOE",
    authDomain: "estacionamento-2143e.firebaseapp.com",
    projectId: "estacionamento-2143e",
    storageBucket: "estacionamento-2143e.firebasestorage.app",
    messagingSenderId: "777375505733",
    appId: "1:777375505733:web:c9d779d398275d70eeb22c",
    measurementId: "G-B24HKZRHWF"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Função para obter a tarifa atual
async function obterTarifaAtual() {
    try {
        // Referência ao documento "tarifa" na coleção "tarifas"
        const docRef = doc(db, "tarifas", "tarifa");
        
        // Obtém o documento
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            // Atualiza o conteúdo do span com a tarifa atual
            const tarifaAtual = docSnap.data().valor;
            document.getElementById('tarifaAtual').textContent = `R$ ${tarifaAtual.toFixed(2)}`;
        } else {
            console.log("Documento não encontrado!");
        }
    } catch (error) {
        console.error("Erro ao obter a tarifa: ", error);
    }
}

// Chama a função para exibir a tarifa atual ao carregar a página
obterTarifaAtual();

// Função para alterar a tarifa
export async function alterarTarifa(novaTarifa) {
    if (auth.currentUser && auth.currentUser.email === 'admin@example.com') {
        try {
            // Acessa o documento "tarifa" e atualiza o valor
            const docRef = doc(db, "tarifas", "tarifa");
            await setDoc(docRef, { valor: novaTarifa });
            alert('Tarifa atualizada no valor de R$ ' + novaTarifa + ' com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar a tarifa:', error);
        }
    } else {
        alert('Somente o ADMIN pode alterar a tarifa.');
    }
}

// Escutando em tempo real a tarifa atualizada no Firestore
const docRef = doc(db, "tarifas", "tarifa");

onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
        const tarifaAtual = docSnap.data().valor;
        document.getElementById('tarifaAtual').textContent = `R$ ${tarifaAtual.toFixed(2)}`;
    }
});

// Adicionando a lógica de alteração da tarifa ao clicar no botão
document.getElementById("alterarTarifaButton").addEventListener("click", () => {
    const novaTarifa = parseFloat(document.getElementById("novaTarifa").value);
    if (!isNaN(novaTarifa) && novaTarifa >= 0) {
        alterarTarifa(novaTarifa);
    } else {
        alert('Por favor, insira um valor válido para a tarifa.');
    }
});
