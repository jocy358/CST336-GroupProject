document.querySelector("#submit").addEventListener('click', searchRecipe);

async function searchRecipe() {
    // alert("function working")
    let searchQuery = document.querySelector("#recipeSearch").value.replace(/\s+/g, "+");
    // console.log(searchQuery);
    let apiKey = "c408505b3ad44b8ebf90a2476f81d6a3";
    let url = "https://api.spoonacular.com/recipes/findByIngredients?ingredients=" + searchQuery + "&number=10&apiKey=" + apiKey;

    let response = await fetch(url);
    let data = await response.json();
    // console.log(data);
    displayResults(data);
}

function displayResults(recipes) {
    let results = document.getElementById("results");
    results.innerHTML = "";

    if (recipes.length == 0){
        results.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    recipes.forEach(recipe => {
        displayRecipe(recipe.id);
    });
}

async function displayRecipe(recipeID) {
    let apiKey = "c408505b3ad44b8ebf90a2476f81d6a3";
    let url = "https://api.spoonacular.com/recipes/" + recipeID + "/information?includeNutrition=false&apiKey=" + apiKey;

    let response = await fetch(url);
    let data = await response.json();
    // console.log(data);

    let title = data.title;
    let image = data.image;
    let servings = data.servings;
    let cookingMinutes = data.cookingMinutes;
    let sourceUrl = data.sourceUrl;

    let recipeDiv = document.createElement("div");
    recipeDiv.innerHTML = `
        <h1>${title}</h1>
        <img src="${image}" alt="${title}" width="300">
        <p><strong>Servings:</strong> ${servings}</p>
        <p><strong>Cooking time:</strong> ${cookingMinutes} minutes</p>
        <p><a href="${sourceUrl}" target="_blank">View Full Recipe</a></p>`;

    document.getElementById("results").appendChild(recipeDiv);
}