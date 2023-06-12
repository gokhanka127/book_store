let bookList = [], basketList = [];

// Toast Uyarı Bölümü kodları
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

const toggleModal = () => {
    const basketModalEl = document.querySelector(".basket_modal")
    basketModalEl.classList.toggle("active")
};

/* const getBooks = () => {
    fetch("./products.json")
        .then(res => res.json())
        .then(books => (bookList = books));
}; */
const getBooks = async () => {
    const res = await fetch("./products.json")
    const books = await res.json()
    bookList = books

};

getBooks();

const createBookStars = (starRate) => {
    let starRateHtml = "";
    for (let i = 1; i <= 5; i++) {
        if (Math.round(starRate) >= i) starRateHtml += `<i class="bi bi-star-fill active"></i>`;
        else starRateHtml += `<i class="bi bi-star-fill"></i>`;
    }
    return starRateHtml;
};

const createBookItemsHtml = () => {
    const bookListEl = document.querySelector(".book_list");
    let bookListHtml = "";
    bookList.forEach((book, index) => {
        bookListHtml += `<div class="col-5 ${index % 2 == 0 && "offset-2"} ">
        <div class="row book_card">
            <div class="col-6">
                <img 
                class="img-fluid shadow" 
                src="${book.imgSource}" alt="">
            </div>
            <div class="col-6 d-flex flex-column">
                <div class="book_details">
                    <span class="book_author">${book.author}</span>
                    <h3 class="book_name">${book.name}</h3>
                    <span class="book_rate">
                        ${createBookStars(book.starRate)}
                        <small class="book_review">${book.reviewCount} Reviews</small>
                    </span>
                </div>
                <div class="mt-3">
                    <p class="book_description">${book.description}</p>
                    <div>
                        <span class="price me-2">${book.price}₺</span>
                        ${book.oldPrice ? `<span class="price_prev text-decoration-line-through">${book.oldPrice}₺</span>` : ""}
                    </div>
                    <button class="add_btn mt-2" onclick="addBookToBasket(${book.id})">Add Basket</button>
                </div>
            </div>
        </div>
    </div>`;
    });
    bookListEl.innerHTML = bookListHtml;

};


const BOOK_TYPES = {
    ALL: "TÜMÜ",
    CHILDREN: "ÇOCUK",
    NOVEL: "ROMAN",
    SELFIMPROVEMENT: "KİŞİSEL GELİŞİM",
    SCIENCE: "BİLİM",
    HISTORY: "TARİH",
    FINANCE: "FİNANS",
};

const createBookTypesHtml = () => {
    const filterEl = document.querySelector(".filter");
    let filterHtml = "";
    let filterTypes = ["ALL"];
    bookList.forEach(book => {
        if (filterTypes.findIndex((filter) => filter == book.type) == -1)
            filterTypes.push(book.type);
    });

    filterTypes.forEach((type, index) => {
        filterHtml += `<li class="${index == 0 ? "active" : null}" onclick="filterBooks(this)" data-type="${type}">${BOOK_TYPES[type] || type}</li>`;
    });

    filterEl.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
    document.querySelector(".filter .active").classList.remove("active");
    filterEl.classList.add("active");
    let bookType = filterEl.dataset.type;
    getBooks();
    if (bookType != "ALL") bookList = bookList.filter((book) => book.type == bookType);
    createBookItemsHtml();
}

//Sepet Bölümü

const listBasketItems = () => {
    localStorage.setItem("basketList", JSON.stringify(basketList));
    const basketListEl = document.querySelector(".basket_list");
    const basketCountEl = document.querySelector(".bag_count");
    basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
    const totalPriceEl = document.querySelector(".total_price");

    let basketListHtml = "";
    let totalPrice = 0;
    basketList.forEach((item) => {
        totalPrice += item.product.price * item.quantity;
        basketListHtml += `<li class="basket_item">
        <img src="${item.product.imgSource}" width="70px">
        <div class="basket_item_info">
            <h4>${item.product.name}</h4>
            <span>${item.product.price} TL</span><br/>
            <span onclick="removeItemToBasket(${item.product.id})">Remove</span>
        </div>
        <div class="book_count">
            <span class="decrease ms-1" onclick="decreaseBasket(${item.product.id})">-</span>
            <span class="number mx-1">${item.quantity}</span>
            <span class="increase me-1" onclick="increaseBasket(${item.product.id})">+</span>
        </div>
    </li>`;
    });
    basketListEl.innerHTML = basketListHtml ? basketListHtml :
        `<li class="basket_item"> No items in your basket. </li>`;
    totalPriceEl.innerHTML = totalPrice > 0 ? "Total: " + totalPrice.toFixed(2) + "TL" : null;
};


// Sepete ekleme metodu
const addBookToBasket = (bookId) => {
    let findedBook = bookList.find((book) => book.id == bookId);
    if (findedBook) {
        const basketAlreadyIndex = basketList.findIndex(
            (basket) => basket.product.id == bookId);
        if (basketAlreadyIndex == -1) {
            let addedItem = { quantity: 1, product: findedBook };
            basketList.push(addedItem);
        } else {
            if (
                basketList[basketAlreadyIndex].quantity <
                basketList[basketAlreadyIndex].product.stock
            )
                basketList[basketAlreadyIndex].quantity += 1;
            else {
                toastr.error("Sorry, we don't have enough stock.");
                return;
            }
        }
        listBasketItems();
        toastr.success("Book added to basket successfully.")
    }
};


// Sepetten kaldırma metodu

const removeItemToBasket = (bookId) => {
    const findedIndex = basketList.findIndex((basket) => basket.product.id == bookId);
    if (findedIndex != -1) {
        basketList.splice(findedIndex, 1);
    }
    listBasketItems();
};

// Sepet Azaltma metodu

const decreaseBasket = (bookId) => {
    const findedIndex = basketList.findIndex((basket) => basket.product.id == bookId);
    if(findedIndex != -1){
       if (basketList[findedIndex].quantity != 1)
            basketList[findedIndex].quantity -= 1;
            else removeItemToBasket (bookId);
            listBasketItems();
    }
};


// Sepet Artırma metodu
const increaseBasket = (bookId) => {
    const findedIndex = basketList.findIndex((basket) => basket.product.id == bookId);
    if(findedIndex != -1){
       if (basketList[findedIndex].quantity < basketList[findedIndex].product.stock)
            basketList[findedIndex].quantity += 1;
            else toastr.error("Sorry we do not have enough stock.")
            listBasketItems();
    }
};


if (localStorage.getItem("basketList")){
    basketList = JSON.parse(localStorage.getItem("basketList"));
    listBasketItems();
}

setTimeout(() => {
    createBookItemsHtml();
    createBookTypesHtml();
}, 100);

