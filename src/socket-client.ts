import { Manager, Socket } from "socket.io-client"

let socket: Socket

export const connectToServer = ( token: string ) => {
    //Url de la conexión con backend
    const manager = new Manager('localhost:3000/socket.io/socket.io.js', {
        extraHeaders: {
            hola: 'mundo',
            authentication: token
        }
    })
    //Eliminar addListener anteriores
    socket?.removeAllListeners()
    //a cuál namespace me conecto?
    socket = manager.socket('/')
    
    //Lista de eventos que escucha el servidor
    addListeners()
}

const addListeners = () => {
    const serverStatusLabel = document.querySelector('#server-status')
    //Listar los ID
    const clientsUl = document.querySelector('#clients-ul')
    //Tomar form e input para crear el chat
    const messageForm = document.querySelector<HTMLFormElement>('#message-form')!
    const messageInput = document.querySelector<HTMLInputElement>('#message-input')!
    //Listar los mensajes
    const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!

    //on es para escuchar el estado del servidor
    socket.on('connect', () => {
        serverStatusLabel.innerHTML = 'connected'
    })

    socket.on('disconnect', () => {
        serverStatusLabel.innerHTML = 'disconnected'
    })

    socket.on('clients-update', ( clients: string[] ) => {
        let clientsHtml = ''
        clients.forEach( clienId => {
            clientsHtml += `
                <li>${ clienId }</li>
            `
        })
        clientsUl.innerHTML = clientsHtml
    })

    messageForm.addEventListener('submit', event => {
        event.preventDefault()
        if( messageInput.value.trim().length <= 0 ) return

        socket.emit('message-from-client', {
            id: 'yo',
            message: messageInput.value
        })
        //limpiar el input
        messageInput.value = ''
    })

    socket.on('message-from-server', (payload: { fullName: string, message: string }) => {
        //crear la estructura HTML
        const newMessage = `
            <li>
                <strong>${ payload.fullName }</strong>
                <span>${ payload.message }</span>
            </li>
        `        
        //Crear la lista y agrega el mensaje a li
        const li = document.createElement('li')
        li.innerHTML = newMessage        
        //agrega el HTML como último hijo
        messagesUl.append( li )
    })
}
