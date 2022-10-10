const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const newUser = async () => {
    const datos = await axios('https://randomuser.me/api');
    const usuario = datos.data.results[0];
    const roommate = {
        id: uuidv4().slice(30),
        correo: usuario.email,
        nombre: `${usuario.name.first} ${usuario.name.last}`,
        debe: 0,
        recibe: 0,
    };
    return roommate
};

const addGasto = (body) => {
    let verRm = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
    let datosRm = verRm.roommates;
    let conteoRm = datosRm.length;
    datosRm.map((e) => {
        if (e.nombre == body.roommate) {
            let recibe = body.monto / conteoRm;
            e.recibe += parseFloat(recibe.toFixed(2));
        } else if (e.nombre !== body.roommate) {
            let debe = body.monto / conteoRm;
            e.debe += parseFloat(debe.toFixed(2));
        }
        fs.writeFileSync("roommates.json", JSON.stringify(verRm));
    });
};
const modGasto = (body) => {
    let roommate = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
    let datosRm = roommate.roommates;
    let conteoRm = datosRm.length;
    const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    gastosJSON.gastos.map((g) => {
        datosRm.map((e) => {
            if (e.nombre == body.roommate) {
                let recibe;
                recibe = body.monto / conteoRm;
                e.recibe = parseFloat(recibe.toFixed(2));
            } else if (e.nombre !== body.roommate) {
                let nuevoConteo = conteoRm - 1;
                let nuevoGasto = g.monto / conteoRm;
                console.log(nuevoGasto);
                let debe;
                debe = nuevoGasto;
                e.debe = parseFloat(debe.toFixed(2));
            }
        });
        fs.writeFileSync("roommates.json", JSON.stringify(verRm));
    });
};

module.exports = { newUser, addGasto, modGasto };

// const axios = require('axios');

// // Sacar función a archivo externo
// async function getUser(){
//     let { data } = await axios.get('https://randomuser.me/api/');
//     return data;
// }

// module.exports = getUser;
