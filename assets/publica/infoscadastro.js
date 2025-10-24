const form = document.getElementById('formCadastro')
form.addEventListener('submit', async(b)=>{ 
    b.preventDefault();  //Função que previne a página carregar após o submit ser clicado

    const usuario = document.getElementById('usuario_cadastro').value
    const email = document.getElementById('email_cadastro').value
    const senha = document.getElementById('senha_cadastro').value


    const res = await fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'authorization':'123@321'},
        body: JSON.stringify({usuario,email,senha})
    })

    const data = await res.json();
    alert(data.message);
})