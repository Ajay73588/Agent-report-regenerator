// Sample product data
const products = [
    {
        name: "Apple",
        price: "$1.99",
        image: "https://via.placeholder.com/150"
    },
    {
        name: "Banana",
        price: "$0.99",
        image: "https://via.placeholder.com/150"
    },
    {
        name: "Orange",
        price: "$2.49",
        image: "https://via.placeholder.com/150"
    },
    {
        name: "Mango",
        price: "$3.99",
        image: "https://via.placeholder.com/150"
    },
    {
        name: "Grapes",
        price: "$2.99",
        image: "https://via.placeholder.com/150"
    },
    {
        name: "Pineapple",
        price: "$4.99",
        image: "https://via.placeholder.com/150"
    }
];

// Function to display products
function displayProducts() {
    const productList = document.querySelector('.product-list');
    productList.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.price}</p>
        `;

        productList.appendChild(productCard);
    });
}

// Display products when the page loads
window.onload = displayProducts;