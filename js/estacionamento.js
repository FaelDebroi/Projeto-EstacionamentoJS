// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";  // Certifique-se de importar o updateDoc corretamente

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
console.log("Conexão com o Firestore:", db);


const entrarBtn = document.getElementById('entrar');
const placaInput = document.getElementById('placa');
const cketList = document.getElementById('ckets-list');
const convenioCheckbox = document.getElementById('convenio');
const lojaSelect = document.getElementById('loja-convenio');  




// puxar do Firebase
async function puxarTarifa() {
    try {
        // Referência ao documento "tarifa" na coleção "tarifas"
        const docRef = doc(db, "tarifas", "tarifa");
        
        // Obtém o documento
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const tarifaAtual = docSnap.data().valor; // Obtém o valor da tarifa
            document.getElementById('valor-tarifa').textContent = `R$ ${tarifaAtual.toFixed(2)}`;
        } else {
            console.log("Documento de tarifa não encontrado");
        }

    } catch (error) {
        console.error("Erro ao buscar tarifa:", error);
    }
}

// adicionar Firestore
async function adicionarCket(placa,lojaSelecionada ) {
    try {
        const convenio = convenioCheckbox.checked;
        // coleção de tickets
        const cketRef = await addDoc(collection(db, "tickets"), {
            placa: placa,
            entrada: new Date(), 
            pago: 0, 
            saida: null,
            convenio: convenio,
            NomeConvenio: lojaSelecionada
        });
        console.log("Cket criado com ID: ", cketRef.id);
        exibirCkets();
    } catch (e) {
        console.error("Erro ao adicionar cket: ", e);
    }
}

// exibir os ckets na tela
async function exibirCkets() {
    cketList.innerHTML = ""; // Limpa a lista antes de exibir

    const q = query(collection(db, "tickets"), where("saida", "==", null));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const ticket = doc.data();
        let convenioTexto = ticket.convenio ? "Sim" : "Não";

        const ticketElement = document.createElement('div');
        ticketElement.classList.add('ticket');
        ticketElement.innerHTML = `
            <p>Placa: ${ticket.placa}</p>
            <p>Entrada: ${ticket.entrada.toDate().toLocaleString()}</p>
            <p>Valor pago: R$ ${0}</p>
            <p>Você tem convênio: ${convenioTexto}</p>
            <button class="sair" onclick="registrarSaida('${doc.id}')">Registrar Saída</button>
        `;
        cketList.appendChild(ticketElement);
    });
}

//  saída do cket e calcular o valor pago
window.registrarSaida = async function(ticketId) { 
    try {
        const ticketRef = doc(db, "tickets", ticketId);  
        const ticketDoc = await getDoc(ticketRef);
        const PossuiConvenio = ticketDoc.data().convenio; 
        const NomeConvenio = ticketDoc.data().NomeConvenio; 

        const docRef = doc(db, "tarifas", "tarifa");
        const docSnap = await getDoc(docRef);
        const tarifaAtual = docSnap.data().valor; 


        if (ticketDoc.exists()) {
            const dataEntrada = ticketDoc.data().entrada.toDate();
            const possuiConvenio = ticketDoc.data().convenio;
            const tempoPermanencia = (new Date() - dataEntrada) / 1000 / 60 / 60; // Tempo em horas
            
            let valorTotal = 0; 


            if (tempoPermanencia <= 1) {
                valorTotal = tarifaAtual;
            }else{
                const horasExtras = tempoPermanencia - 1;
                const desconto = tarifaAtual * 0.5;
                valorTotal = tarifaAtual + (horasExtras * desconto);          
            }

            if (PossuiConvenio && NomeConvenio != null) {
                console.log(PossuiConvenio);
                console.log(NomeConvenio);
                const conveniosRef = collection(db, "convenios");
                const q = query(conveniosRef, where("nome", "==", NomeConvenio));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    const convenio = doc.data(); 
                    if (convenio.desconto) {
                        valorTotal = valorTotal - convenio.desconto; 
                    }
                });
            }

            // Atualiza a data e hora de saída e valor
            await updateDoc(ticketRef, {  
                saida: new Date(), 
                pago: valorTotal 
            });

            console.log("Cket atualizado com valor pago: ", valorTotal);
            exibirCkets(); // Atualiza ckets
        }
    } catch (e) {
        console.error("Erro ao registrar saída: ", e);
    }
};

convenioCheckbox.addEventListener('change', verificarConvenio); // chama o select das lojas

// visibilidade convenio
function verificarConvenio() {

    const convenioCheckbox = document.getElementById('convenio');
    const lojaSelect = document.getElementById('loja-convenio');

    if (convenioCheckbox.checked) {
        lojaSelect.style.display = 'inline'; 
    } else {
        lojaSelect.style.display = 'none';   
    }
}


//entrar button
entrarBtn.addEventListener('click', () => {
    const placa = placaInput.value;
    if (placa) {
        const convenioCheckbox = document.getElementById('convenio');
        if (convenioCheckbox.checked) {
            const lojaSelecionada = lojaSelect.value;
            if (lojaSelecionada) {
                console.log(`Loja selecionada: ${lojaSelecionada}`);
                adicionarCket(placa,lojaSelecionada,);
                placaInput.value = ""; 
                return; 
             } else {
                alert("Selecione uma loja Parceira!");  
                return;   
            }
        }
        adicionarCket(placa,null);
        placaInput.value = ""; 
        return; 
    }else{
        alert("Digite sua placa!");
    }
});


async function carregarLojasConvenio() {
    try {
        const conveniosRef = collection(db, "convenios"); 
        const conveniosSnapshot = await getDocs(conveniosRef); 

        lojaSelect.innerHTML = '<option value="">Selecione a loja conveniada</option>';


        conveniosSnapshot.forEach((doc) => {
            const loja = doc.data(); // Obtém os dados do documento
            const nomeLoja = loja.nome;
            const desconto = loja.desconto;

            if (nomeLoja && desconto !== undefined) {  
                const option = document.createElement('option');
                option.value = nomeLoja;
                option.textContent = `${nomeLoja} - Desconto: R$ ${desconto} `;
                lojaSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Erro ao carregar lojas conveniadas:", error);
    }
}

// atualiza
window.onload = () => {
    puxarTarifa();
    carregarLojasConvenio();
    verificarConvenio(); 
};

// função para exibir os ckets ao carregar 
exibirCkets();


