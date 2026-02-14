// Filtro em tempo real para a página Adote um Gatinho

document.addEventListener("DOMContentLoaded", function () {
    // Seletores dos filtros
    const buscarInput = document.getElementById("buscar");
    const corSelect = document.getElementById("cor");
    const sexoSelect = document.getElementById("sexo");
    const idadeSelect = document.getElementById("idade");
    const vacinadoCheck = document.getElementById("filtro-vacinado");
    const castradoCheck = document.getElementById("filtro-castrado");
    const cards = document.querySelectorAll(".card-gatinho");
    const encontradosSpan = document.querySelector(".gatinhos-encontrados");

    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "");
    }

    function filtrarCards() {
        let encontrados = 0;
        cards.forEach((card) => {
            // Nome
            const nome = card.querySelector("h4")?.textContent || "";
            // Cidade
            const local = card.querySelector(".localizacao")?.textContent || "";
            // Cor
            const cor = card.querySelector(".cor")?.textContent || "";
            // Sexo
            const sexo = card.querySelector(".sexo")?.textContent || "";
            // Idade
            const idade = card.querySelector(".idade")?.textContent || "";
            // Vacinado
            const vacinado = !!card.querySelector(".badge.vacinado");
            // Castrado
            const castrado = !!card.querySelector(".badge.castrado");

            // Filtros
            const buscaValor = normalizarTexto(buscarInput.value.trim());
            const corValor = corSelect.value;
            const sexoValor = sexoSelect.value;
            const idadeValor = idadeSelect.value;
            const vacinadoValor = vacinadoCheck.checked;
            const castradoValor = castradoCheck.checked;

            // Lógica de filtro
            let mostrar = true;
            if (buscaValor) {
                const nomeLocal = normalizarTexto(nome + " " + local);
                if (!nomeLocal.includes(buscaValor)) mostrar = false;
            }
            // Filtro de cor
            if (corValor !== "Todas") {
                if (corValor === "Tigrado") {
                    if (cor !== "Tigrado" && cor !== "Tigre") mostrar = false;
                } else if (cor !== corValor) {
                    mostrar = false;
                }
            }
            if (sexoValor !== "Ambos" && sexo !== sexoValor) mostrar = false;
            if (idadeValor !== "Todas") {
                if (
                    idadeValor === "Filhote" &&
                    !idade.toLowerCase().includes("mes")
                )
                    mostrar = false;
                if (
                    idadeValor === "Adulto" &&
                    idade.toLowerCase().includes("mes")
                )
                    mostrar = false;
            }
            if (vacinadoValor && !vacinado) mostrar = false;
            if (castradoValor && !castrado) mostrar = false;

            if (mostrar) {
                card.style.display = "";
                encontrados++;
            } else {
                card.style.display = "none";
            }
        });
        if (encontradosSpan) {
            encontradosSpan.textContent = `${encontrados} gatinhos encontrados`;
        }
    }

    // Eventos de filtro em tempo real
    [
        buscarInput,
        corSelect,
        sexoSelect,
        idadeSelect,
        vacinadoCheck,
        castradoCheck,
    ].forEach((el) => {
        el && el.addEventListener("input", filtrarCards);
        el && el.addEventListener("change", filtrarCards);
    });

    // Esconde lupa e placeholder ao focar/digitar
    const iconLupa = document.querySelector(".icon-lupa");
    buscarInput.addEventListener("focus", function () {
        buscarInput.setAttribute("placeholder", "");
        if (iconLupa) iconLupa.style.display = "none";
    });
    buscarInput.addEventListener("input", function () {
        if (buscarInput.value.trim() !== "") {
            buscarInput.setAttribute("placeholder", "");
            if (iconLupa) iconLupa.style.display = "none";
        } else {
            buscarInput.setAttribute("placeholder", "Nome ou cidade...");
            if (iconLupa) iconLupa.style.display = "";
        }
    });
    buscarInput.addEventListener("blur", function () {
        if (buscarInput.value.trim() === "") {
            buscarInput.setAttribute("placeholder", "Nome ou cidade...");
            if (iconLupa) iconLupa.style.display = "";
        }
    });

    // Filtro inicial
    filtrarCards();
});
