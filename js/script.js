$(document).ready(function() {
	var firebaseConfig = {
		apiKey: "AIzaSyARHDLzu-Su4SERXGfkXwoc6RWa4GV14KQ",
		authDomain: "mecontrata-b56f9.firebaseapp.com",
		databaseURL: "https://mecontrata-b56f9.firebaseio.com",
		projectId: "mecontrata-b56f9",
		storageBucket: "mecontrata-b56f9.appspot.com",
		messagingSenderId: "266830025041",
		appId: "1:266830025041:web:0e24b9a514f60033620370",
		measurementId: "G-EG4E7EG6F7"
	};

	firebase.initializeApp(firebaseConfig);

	firebase.analytics();

	var database = firebase.database();

	function eraseForm() {
		$("input[name='id']").val("");
		$("input[name='nome']").val("");
		$("input[name='canal']").val("");
		$("input[name='valor']").val("");
		$("textarea[name='obs']").val("");
		$("textarea[name='obs']").html("");
	}

	function resetDivs() {
		$(".input-error").css("display", "none");
		$(".form-result").css("display", "none");
		$("#contato-form button").removeAttr("disabled");
		$(".saving-loading").css("display", "none");
	}

	function getContatos() {
		$(".table-loading").css("display", "flex");

		$(".table-wrapper .table-body").html("");

		var contatosRef = firebase.database().ref("contatos/");
		contatosRef.on("value", snapshot => {
			let tableRow = "";
			let contatos = snapshot.val();

			Object.keys(contatos).forEach(key => {
				tableRow += formatTableRow(
					key,
					contatos[key].nome,
					contatos[key].canal,
					contatos[key].valor,
					contatos[key].obs
				);
			});

			$(".table-loading").css("display", "none");

			$(".table-wrapper .table-body").html(tableRow);
		});
	}

	getContatos();

	function formatTableRow(id, nome, canal, valor, obs) {
		return `
            <tr class="contato_${id}">
                <input type="hidden" value="${id}" />
                <td class="nome">
                    ${nome}
                </td>
                <td class="canal">
                    ${canal}
                </td>
                <td class="valor">
                    ${valor}
                </td>
                <td class="observacao">
                    ${obs}
                </td>
                <td>
                    <button type="button" class="btn-edit-modal">
                        <img src="img/edit-solid.svg" />
                    </button>
                </td>
            </tr>
        `;
	}

	$("body").on("click", ".btn-edit-modal", function() {
		eraseForm();
		resetDivs();

		var contatoDom = $(this)
			.parent()
			.parent();

		var id = contatoDom.children("input").val();
		var nome = contatoDom.children(".nome").html();
		var canal = contatoDom.children(".canal").html();
		var valor = contatoDom.children(".valor").html();
		var obs = contatoDom.children(".observacao").html();

		$("input[name='id']").val(id.trim());

		$("input[name='nome']").val(nome.trim());

		$("input[name='canal']").val(canal.trim());

		$("input[name='valor']").val(valor.trim());

		$("textarea[name='obs']").val(obs.trim());

		$("textarea[name='obs']").html(obs.trim());

		$("#myModal h2").html("Editar contato");

		$("#contato-form button").html("Salvar alteração");

		$(".modal").css("display", "block");
	});

	$("body").on("click", ".btn-add-modal", function() {
		eraseForm();
		resetDivs();

		$("#myModal h2").html("Adicionar contato");

		$("#contato-form button").html("Salvar");

		$(".modal").css("display", "block");
	});

	$("body").on("click", ".close", function() {
		$(".modal").css("display", "none");
	});

	$("body").on("submit", "#contato-form", function(event) {
		event.stopPropagation();

		event.preventDefault();

		var id = $("input[name='id']").val();

		var nome = $("input[name='nome']").val();

		var canal = $("input[name='canal']").val();

		var valor = $("input[name='valor']").val();

		var obs = $("textarea[name='obs']").val();

		if (nome.trim() === "" || canal.trim() === "" || valor.trim() === "") {
			$(".input-error").css("display", "block");

			if (nome.trim() === "") {
				$("input[name='nome']")
					.next()
					.html("Nome é obrigatório");
			}

			if (canal.trim() === "") {
				$("input[name='canal']")
					.next()
					.html("Canal é obrigatório");
			}

			if (valor.trim() === "") {
				$("input[name='valor']")
					.next()
					.html("Valor é obrigatório");
			}

			return false;
		}

		$(".input-error").css("display", "none");

		$(".form-result").css("display", "none");

		$("#contato-form button").attr("disabled", "true");

		$(".saving-loading").css("display", "block");

		let responseCallback = error => {
			$("#contato-form button").removeAttr("disabled");

			$(".saving-loading").css("display", "none");

			$(".form-result").css("display", "block");

			if (error) {
				$(".form-result").addClass("form-error");

				$(".form-result").html("Não foi possível salvar os dados.");
			} else {
				$(".modal").css("display", "none");

				eraseForm();

				getContatos();
			}
		};

		let contato = {
			nome: nome,
			canal: canal,
			valor: valor,
			obs: obs
		};

		if (id === "") {
			database.ref("contatos/").push(contato, responseCallback);
		} else {
			database.ref("contatos/" + id).set(contato, responseCallback);
		}
	});
});
