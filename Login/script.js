document.addEventListener("DOMContentLoaded", () => {

/* ===============================================
   MODAL RECUPERAR SENHA
=============================================== */

const openRecovery  = document.getElementById("openRecovery");
const closeRecovery = document.getElementById("closeRecovery");
const recoveryModal = document.getElementById("recoveryModal");

if (openRecovery && closeRecovery && recoveryModal) {

openRecovery.addEventListener("click", (e) => {
    e.preventDefault();
    recoveryModal.classList.add("active");
});

closeRecovery.addEventListener("click", () => {
    recoveryModal.classList.remove("active");
});

recoveryModal.addEventListener("click", (e) => {
    if (e.target === recoveryModal) {
        recoveryModal.classList.remove("active");
    }
});

}

/* ===============================================
   MOSTRAR / OCULTAR SENHA
=============================================== */

function togglePassword(inputId, button){

    const input = document.getElementById(inputId);

    const icon = button.querySelector("img");

    if(input.type === "password"){

        input.type = "text";

        icon.src =
        "../assets/images/olho-senha.png";

        icon.alt =
        "Ocultar senha";

    }else{

        input.type = "password";

        icon.src =
        "../assets/images/olho-senha-hidden.png";

        icon.alt =
        "Mostrar senha";
    }
}

/* ===============================================
   LOGIN — ENTRAR (via Django API)
=============================================== */

const formLogin = document.getElementById("formLogin");
const erroLogin = document.getElementById("erroLogin");

if (!formLogin) return;

formLogin.addEventListener("submit", async function (e) {

    e.preventDefault();
    erroLogin.textContent = "";

    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginSenha").value;

    if (!username || !password) {
        erroLogin.textContent = "Preencha todos os campos.";
        return;
    }

    try {
        const res = await fetch(API.BASE_URL + '/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            erroLogin.textContent = "Usuário ou senha inválidos.";
            return;
        }

        auth.login(
          { access: data.access, refresh: data.refresh },
          {
            role: user.role || 'visitor',
            email: user.email || '',
            name: (user.first_name + ' ' + user.last_name).trim() || user.username,
          }
        );

        window.location.href = '../selection_area/index.html';

    } catch (err) {
        erroLogin.textContent = "Erro ao conectar ao servidor. Verifique se o backend está rodando.";
    }

});

/* ===============================================
   CADASTRO — CRIAR CONTA
=============================================== */

const formCadastro = document.querySelector("#cadastro-form form");

if (formCadastro) {

formCadastro.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nome = document.getElementById("cadNome").value.trim();
    const sobrenome = document.getElementById("cadSobrenome").value.trim();
    const email = document.getElementById("cadEmail").value.trim();
    const senha = document.getElementById("cadSenha").value;

    const nomeCompleto = nome + " " + sobrenome;
    const erroEl = document.getElementById("erroCadastro");

    if (senha.length < 8) {
        erroEl.textContent = "A senha deve ter no mínimo 8 caracteres";
        return;
    }

    if (!email) {
        erroEl.textContent = "Informe um e-mail válido.";
        return;
    }

    erroEl.textContent = "";
    erroEl.style.color = "";

    var username = email.split('@')[0];

    try {
        const res = await fetch(API.BASE_URL + '/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                password: senha,
                first_name: nome,
                last_name: sobrenome
            })
        });

        const data = await res.json();

        if (!res.ok) {
            erroEl.textContent = data.username ? data.username[0] : (data.email ? data.email[0] : "Erro ao criar conta.");
            return;
        }

        mostrarLogin();

        var toast = document.createElement("div");
        toast.id = "toastCadastro";
        toast.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#111827;border:1px solid #1e2d45;border-radius:16px;padding:32px 40px;text-align:center;z-index:999;box-shadow:0 16px 48px rgba(0,0,0,0.5);animation:fadeIn 0.2s ease;";
        toast.innerHTML = '<div style="width:56px;height:56px;border-radius:50%;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;color:#3b82f6;"><i class="fa-solid fa-check-circle"></i></div><p style="color:#fff;font-size:15px;font-weight:500;margin:20px 0;">Conta criada com sucesso!</p><button onclick="this.parentElement.remove()" style="padding:10px 40px;border-radius:8px;font-size:14px;font-weight:600;color:#fff;background:#3b82f6;border:none;cursor:pointer;">OK</button>';
        document.body.appendChild(toast);

    } catch (err) {
        erroEl.textContent = "Erro ao conectar ao servidor.";
    }

});

}

});

/* ===============================================
   ALTERNAR ENTRE LOGIN / CADASTRO
=============================================== */

function mostrarCadastro() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('cadastro-form').classList.remove('hidden');
}

function mostrarLogin() {
    document.getElementById('cadastro-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

/* Anti Copy */
