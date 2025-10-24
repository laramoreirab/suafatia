const form = document.getElementById('formLogin')
form.addEventListener('submit', async(b)=>{
    b.preventDefault();

    const email = document.getElementById('email_login').value
    const senha = document.getElementById('senha_login').value

     if (!email || !senha) {
    alert('Preencha todos os campos')
    return
  }

    const res= await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json' , 'authorization':'123@321'},
        body: JSON.stringify({email,senha})
    })

    if (!res.ok) {
    const erro = await res.json()
    alert(erro.erro || 'Erro ao fazer login')
    return
  }

    const data = await res.json();
    
    const token = data.token
    const usuario = data.usuario

    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))

    alert('Login realizado com sucesso!')

})