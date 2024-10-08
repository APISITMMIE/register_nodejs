const BASE_URL = 'http://localhost:8000'

let mode = 'CREATE'
let selectedId = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    if (id) {
        mode = 'EDIT'
        selectedId = id

        //ดึงข้อมูล user เก่า
        try {
            const response = await axios.get(`${BASE_URL}/users/${id}`)
            const user = response.data

            let firstnameDOM = document.querySelector('input[name=firstname]')
            let lastnameDOM = document.querySelector('input[name=lastname]')
            let ageDOM = document.querySelector('input[name=age]')
            let desriptionDOM = document.querySelector('textarea[name=description]')

            firstnameDOM.value = user.firstname
            lastnameDOM.value = user.lastname
            ageDOM.value = user.age
            desriptionDOM.value = user.description

            let genderDOM = document.querySelectorAll('input[name=gender]') 
            let interestDOM = document.querySelectorAll('input[name=interest]')

            console.log('interest', user.interest)

            for (let i = 0; i < genderDOM.length; i++) {
                if (genderDOM[i].value == user.gender) {
                    genderDOM[i].checked = true
                }
            }

            for (let i = 0; i < interestDOM.length; i++) {
                if (user.interest.includes(interestDOM[i].value)) {
                    interestDOM[i].checked = true
                }
            }
            
        
        } catch (error) {
            console.log('error', error)
        }
        //นำข้อมูล user ใส่ไปใน input html
    }
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

const submitData = async () => {
    let firstnameDOM = document.querySelector('input[name=firstname]')
    let lastnameDOM = document.querySelector('input[name=lastname]')
    let ageDOM = document.querySelector('input[name=age]')
    let genderDOM = document.querySelector('input[name=gender]:checked') || {}
    let interestDOM = document.querySelectorAll('input[name=interest]:checked') || {}
    let desriptionDOM = document.querySelector('textarea[name=description]')

    let messageDOM = document.getElementById('message')

    try {
        let interest = ''
        for (let i = 0; i < interestDOM.length; i++) {
            interest += interestDOM[i].value
            if (i != interestDOM.length - 1) {
                interest += ', '
            }
        }


        let userData = {
            firstname: firstnameDOM.value,
            lastname: lastnameDOM.value,
            age: ageDOM.value,
            gender: genderDOM.value,
            description: desriptionDOM.value,
            interest: interest
        }

        console.log('submit data: ', userData)

        const errors = validateData(userData)

        if (errors.length > 0 ) {
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }

        let message = 'บันทึกข้อมูลเรียบร้อย'

        if (mode == 'CREATE') {
            const response = await axios.post(`${BASE_URL}/users`, userData)
            console.log('response', response.data)
        } else {
            const response = await axios.put(`${BASE_URL}/users/${selectedId}`, userData)
            message = 'แก้ไขข้อมูลเรียบร้อย'
            console.log('response', response.data)
        }
       
        messageDOM.innerText = message
        messageDOM.className = 'message success'

    } catch (error) {
        console.log('error message', error.message)
        console.log('error', error.errors)
        if (error.response) {
            console.log(error.response)
            error.message = error.response.data.message
            error.errors = error.response.data.errors
        }

        let htmlData = '<div>'
        htmlData += `<div>${error.message}</div>`
        htmlData += '<ul>'
        for (let u = 0 ; u < error.errors.length; u++) {
            htmlData += `<li>${error.errors[u]}</li>`
        }
        htmlData += '</ul>'
        htmlData += '</div>'

        messageDOM.innerHTML = htmlData
        messageDOM.className = 'message danger'
    }

} 