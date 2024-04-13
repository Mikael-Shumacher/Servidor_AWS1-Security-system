const express = require('express');
const app = express();
const port = 8080;
const http = require('http').createServer(app);
const socketIO = require('socket.io');
const io = socketIO(http);

app.use(express.json());
let sttsESP32 = false;
let ultimaAtualizacao = Date.now();
let reiniciar_esp32 = false;
let alarme_esp32 = false;
var tempoalarme;

app.get('/dados-do-esp32', (req, res) => {
    res.json({ mensagem: 'Esta rota aceita apenas solicitações POST.' });
});

app.get('/status-esp32', (req, res) => {
    try {
        const agora = Date.now();
        const tempoDesdeAtualizacao = agora - ultimaAtualizacao;
        const limiteInatividade = 0.6 * 60 * 1000;
        if (tempoDesdeAtualizacao <= limiteInatividade) {
            res.json({ online: sttsESP32 });
        } else {
            console.log('ESP32 está offline.');
            sttsESP32 = false;
            res.json({ online: false });
        }
    } catch (error) {
        console.error('Erro ao processar a solicitação:', error);
        res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
});

app.get('/reiniciaresp', (req, res) => {
    try {
        if (reiniciar_esp32 == true) {
            res.json(reiniciar_esp32);
            console.log('Reiniciando ESP32');
            reiniciar_esp32 = false;
        }
    } catch {
        console.error('Erro ao enviar [reiniciar]:', error);
    }
});

app.get('/acionar-alarme', (req, res) => {
    if (alarme_esp32 == true) {
        io.emit('alarme');
        console.log('Alarme acionado manualmente.');
        res.json(alarme_esp32);
        alarme_esp32 = false;
    }
});

app.get('/tempo-alarmar', (req, res) => {
    if (alarme_esp32 == true) {
        res.json(tempoalarme);
    }
})

app.post('/atualizar-status', (req, res) => {
    const { status } = req.body;
    sttsESP32 = status
    console.log('Status do ESP32: ', status);
    ultimaAtualizacao = Date.now();
    res.json({ mensagem: 'Status do ESP32 atualizado' });
});

app.post('/Reiniciaresp', (req, res) => {
    const reiniciar = req.body.Botao;
    if (reiniciar == "REINICIAR") {
        reiniciar_esp32 = true;
    }
    console.log('Dados recebidos do app: ', reiniciar);
});

app.post('/alarme', (req, res) => {
    const alarme = req.body.Alarme;
    if (alarme == "ATIVAR") {
        alarme_esp32 = true;
        console.log('Ativando alarme');
        console.log('Dados recebidos do app: ', alarme);
        res.status(200).send('Alarme acionado com sucesso!');
    }
});

app.post('/pessoa_detectada', (req, res) => {
    const pessoa = req.body;
    console.log('Dados da camera: ', pessoa);
});

app.post('/tempo-alarmar', (req, res) => {
    const pessoa = req.body;
    console.log('Dados da camera: ', pessoa);
});

app.post('/dados-do-esp32', (req, res) => {
    const dadosRecebidos = req.body;
    console.log('Dados recebidos do ESP32: ', dadosRecebidos);
    res.json({ mensagem: 'Dados recebidos com sucesso!' });
});

app.post('/tempo-alarme', (req, res) => {
    const temp = req.body.vezes_tocar;
    const vezesTocarInt = parseInt(temp);
    if (Number.isInteger(vezesTocarInt) && alarme_esp32 == true) {
        tempoalarme = temp;
        res.json({ tempoalarme });
    }
    console.log('Vezes de alarme:', temp);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});