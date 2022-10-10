const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'desaimailer@gmail.com',
        pass: "infoclub1",
    }
})

const enviar = (nombre, descripcion, monto) => {
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: 'desaimailerTest@gmail.com',
            to: ['nickgakaz12@gmail.com', 'desaimailerTest@gmail.com', 'silje.pedersen@example.com', 'charlotte.meusel@example.com', 'vanesa.blanco@example.com', 'ysmyn.glshn@example.com'],
            subject: `( Nicolas ) Nuevo gasto agregado!`,
            text: `El nuevo gasto es de ${nombre}. La descripción es la siguiente: ${descripcion} por un monto de $${monto}!!`,
        }
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                reject(err);
            }
            if (data) {
                resolve(data);
            }
        })
    })
}

module.exports = enviar;