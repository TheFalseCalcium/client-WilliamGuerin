Init_UI();

function Init_UI() {
    //renderContacts();
    renderBookmarks();

    $('#pageChange').on('click', function () {
        window.location.href = "index.html";
    });

    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

async function renderBookmarks() {
    showWaitingGif();
    $('#abort').hide();
    $('#createBookmark').show();
    $("#actionTitle").text("Liste de favoris");

    let bookmarks = await API_GetBookmarks();
    eraseContent();

    for (let bookmark of bookmarks) {
        if (selectedCategory != "") {
            if (bookmark.Category.toUpperCase() == selectedCategory.toUpperCase()) {
                $("#content").append(renderBookmark(bookmark));
            }
        } else {
            $("#content").append(renderBookmark(bookmark));
        }

    }
    $(".editCmd").on("click", function () {
        saveContentScrollPosition();
        renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
    });
    $(".deleteCmd").on("click", function () {
        saveContentScrollPosition();
        renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
    });


}
function renderBookmark(bookmark) {

    const getFavicon = '/favicon.ico';
    let urlFavicon = bookmark.Url += getFavicon;

    return $(`
        <div class="contactRow" contact_id=${bookmark.Id}">
           <div class="bookmarkContainer ">
               <div class="bookmark-spacing">
                    
                    <div class="favicoAndTitle">
                        <img src="${urlFavicon}" alt="Le favicon du site" style="height:2em;">
                        <div class="bookmark-title">${bookmark.Title}</div>
                    </div>
                    <div class="bookmark-category">${bookmark.Category}</div>
                        
                </div>
               <div class="contactCommandPanel">
                   <span class="editCmd cmdIcon fa fa-pencil" editbookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                   <span class="deleteCmd cmdIcon fa fa-trash" deletebookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
               </div>
           </div>
       </div>           
       `);
}

function newBookmark() {
    bookmark = {};
    bookmark.Id = 0; bookmark.Title = ""; bookmark.Url = ""; bookmark.Category = "";
    return bookmark;
}

function renderBookmarkForm(bookmark = null) {
    console.log(bookmark);
    const bookmarkImg = "https://img.icons8.com/external-smashingstocks-glyph-smashing-stocks/66/external-bookmark-network-and-communication-smashingstocks-glyph-smashing-stocks.png";

    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    let create = false;
    if (bookmark == null) { bookmark = newBookmark(); create = true; }

    $("#actionTitle").text(create ? "Création" : "Modification");

    let imgSrc = create ? bookmarkImg : bookmark.Url + "/favicon.ico";

    $("#content").append(`
        <form class="form" id="bookmarkForm">
        <input type="hidden" name="Id" value="${bookmark.Id}"/>

        <img src="${imgSrc}"
         class="faviconLogo" title="Icon de l'url" id="favico">
         
         <br><br><br>

         <label for="Title" class="form-label"><b>Titre</b></label>
         <input class="form-control Alpha"

          name="Title"
          required
          placeholder="Titre"
          value="${bookmark.Title}"

         />

         <label for="Url" class="form-label" ><b>Url</b></label>
         <input class="form-control"
          id="url"
          name="Url"
          required
          placeholder="Url"
          value="${bookmark.Url}"

         />

         <label for="Category" class="form-label"><b>Catégorie</b></label>
         <input class="form-control Alpha"

          name="Category"
          required
          placeholder="Catégorie"
          value="${bookmark.Category}"

         />

        <br>
        <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
        <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">

        </form>`);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let newBookmark = getFormData($("#bookmarkForm"));
        console.log(newBookmark);
        newBookmark.Id = parseInt(newBookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(newBookmark, create);
        if (result)
            renderBookmarks();
           
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
    $('#url').on('blur', async function () {
        let getFavicon = '/favicon.ico';
        let url = $('#url').val();

        console.log(isUrlValid('google.com'));
        let urlFavicon = url + getFavicon;
        console.log(urlFavicon);


        if (isUrlValid(urlFavicon)) {
            $('#favico').attr('src', `${urlFavicon}`);
        }
    });
}
function isUrlValid(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}
async function renderDeleteBookmarkForm(bookmarkId) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");

    let bookmark = await API_GetBookmark(bookmarkId);
    eraseContent();

    const getFavicon = '/favicon.ico';
    let urlFavicon = bookmark.Url += getFavicon;

    if (bookmark != null) {
        $("#content").append(`
            <div class="contactdeleteForm">
                <h4>Effacer le favori suivant?</h4>
                <br>
               <div class="bookmarkContainer ">
               <div class="bookmark-spacing">
                    
                    <div class="favicoAndTitle">
                        <img src="${urlFavicon}" alt="Le favicon du site" style="height:2em;">
                        <div class="bookmark-title">${bookmark.Title}</div>
                    </div>
                    <div class="bookmark-category">${bookmark.Category}</div>
                        
                </div>
            </div>
                <br>
                <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
                <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
            </div>    
            `);

        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favori introuvable!");
    }
}
async function renderEditBookmarkForm(bookmarkId) {
    showWaitingGif();
    console.log(bookmarkId)
    let bookmark = await API_GetBookmark(bookmarkId);

    eraseContent();

    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favori introuvable!");


}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de contacts</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}

function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}

function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}

let selectedCategory = "";
// Bout de code que j'ai fait pour le dropdown
$(document).ready(async function () {
    console.log($("#dropdown"));
    $("#dropdown").on("click", async function () {
        let categories = [];
        // aller chercher les categories
        let categoriesElem = await API_GetBookmarks();
        for (let category of categoriesElem) {
            categories.push(category.Category);
        }

        
        let uniqueCategories = [...new Set(categories)];
        console.log(uniqueCategories);
        updateDropDownMenu(uniqueCategories);
    });
});


$('#dropdown ms-auto').on('click', function () {
    console.log("test");
});
function updateDropDownMenu(categories) {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append($(`
    <div class="dropdown-item menuItemLayout" id="allCatCmd">
        <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
    </div>
        `));
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append($(`
            <div class="dropdown-item menuItemLayout category" id="allCatCmd">
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
            </div>
        `));
    })
    DDMenu.append($(`<div class="dropdown-divider"></div> `));
    DDMenu.append($(`
                    <div class="dropdown-item menuItemLayout" id="aboutCmd">
                        <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
                    </div>
                `));
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#allCatCmd').on("click", function () {
        selectedCategory = "";
        renderBookmarks();
    });
    $('.category').on("click", function () {
        selectedCategory = $(this).text().trim();
        renderBookmarks();

    });
}
