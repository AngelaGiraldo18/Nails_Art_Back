const crear=require('../config/dbService')



let insertar= (req,res)=>{
    crear.insertReserva (reserva=>{
        res.status(200).json(reserva);
    })
}

module.exports={
    insertar
}