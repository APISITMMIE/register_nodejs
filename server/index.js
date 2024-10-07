// ทำการ import http เข้ามาเพื่อทำการ run server
// const http = require('http')

// const host = 'localhost' //รันที่ไหน localhost คือเครื่องของเรา
// const port = 8000 // localhost port 8000

// // กำหนดค่าเริ่มต้นของ server เมื่อเปิดหน้าเว็บที่ localhost:8000 ขึ้นมา
// const requestListener = function (req, res) {
//     res.writeHead(200)
//     res.end("My first server!")
// }

// //ทำการ run server
// const server = http.createServer(requestListener)
// server.listen(port, host, () => {
//     console.log(`Server is running on http://${host}:${port}`)
// })

//เรียกใช้ library express ด้วยคำสั่ง require
const express = require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express() // ประกาศเริ่มต้นการใช้ express

app.use(bodyparser.json())
app.use(cors())

const port = 8000

let conn = null

const initMysql = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'tutorials',
        port: '3306'
    })
}

const validateData = (userData) => {
    let errors =[]

    if (!userData.firstname) {
        errors.push('กรุณาใส่ชื่อจริง')
    }
    if (!userData.lastname) {
        errors.push('กรุณาใส่นามสกุล')
    }
    if (!userData.age) {
        errors.push('กรุณาใส่อายุ')
    }
    if (!userData.gender) {
        errors.push('กรุณาใส่เพศ')
    }
    if (!userData.interest) {
        errors.push('กรุณาใส่ความสนใจ')
    }
    if (!userData.description) {
        errors.push('กรุณาใส่รายละเอียด')
    }

    return errors
}

//path = GET /users
app.get('/users', async (req, res) => {
    const results = await conn.query('SELECT * FROM users')
        res.json(results[0])
})

//path = POST /user
app.post('/users', async (req, res) => {
    try {
        let user = req.body

        const errors = validateData(user)
        if (errors.length > 0 ) {
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }

        const results = await conn.query('INSERT INTO users SET ?', user)
        res.json({
            message: 'insert ok',
            data: results[0]
        })
    } catch (error) {
        const errorMessage = error.message || 'something wrong'
        const errors = error.errors || []
        console.log('error message', error.message)
        res.status(500).json({
            message: errorMessage,
            errors: errors
        })
    }   
})


// GET /users/: id 
app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id
        const results = await conn.query('SELECT * FROM users WHERE id = ?', id)  
        
        if (results.length == 0 ) {
           throw { statusCode: 404, message: 'หาไม่เจอ'}
        } 

        res.json(results[0][0]) 
    } catch (error) {
        console.log('error message', error.message)
        let statusCode = error.statusCode || 500
        res.status(statusCode).json({
            message: 'something wrong',
            errorMessage: error.message
        })
    }
})

// path = PUT /user/:id คือ param
app.put('/users/:id', async (req, res) =>{
    try {
        let id = req.params.id
        let updateUser = req.body
        const results = await conn.query('UPDATE users SET ? WHERE id = ?', 
            [updateUser, id])
        res.json({
            message: 'update ok',
            data: results[0]
        })
    } catch (error) {
        console.log('error message', error.message)
        res.status(500).json({
            message: 'something wrong'
        })
    }   
})

// path = DELETE /user
app.delete('/users/:id', async (req, res) => {
    try {
        let id = req.params.id
        const results = await conn.query('DELETE FROM users WHERE id = ?', id)
        res.json({
            message: 'delete ok',
            data: results[0]
        })
    } catch (error) {
        console.log('error message', error.message)
        res.status(500).json({
            message: 'something wrong'
        })
    }  
})

// ประกาศ​gxbf http server ที่ port 8000 (ตามตัวแปร port)
app.listen(port, async (req, res) => {
    await initMysql()
    console.log('http server run at '+ port)
})