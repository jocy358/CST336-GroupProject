document.querySelector("#submit").addEventListener('click', searchRecipe);

async function searchRecipe() {
    // alert("function working")
    let searchQuery = document.querySelector("#recipeSearch").value.replace(/\s+/g, "+");
    // console.log(searchQuery);
    let apiKey = "";
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
    let apiKey = "";
    let url = "https://api.spoonacular.com/recipes/" + recipeID + "/information?includeNutrition=false&apiKey=" + apiKey;

    let response = await fetch(url);
    let data = await response.json();
    // console.log(data);

    let title = data.title;
    let image = data.image;
    let servings = data.servings;
    // let cookingMinutes = data.cookingMinutes;
    let sourceUrl = data.sourceUrl;

    currentRecipe = {
        title: title,
        imageUrl: image,
        recipeUrl: sourceUrl
    };

    let recipeDiv = document.createElement("div");
    recipeDiv.innerHTML = `
        <h1>${title}</h1>
        <img src="${image}" alt="${title}" width="300">
        <p><strong>Servings:</strong> ${servings}</p>
        <p><a href="${sourceUrl}" target="_blank">View Full Recipe</a></p>`;

    document.getElementById("results").appendChild(recipeDiv);

    let buttonsDiv = document.createElement("div");
    buttonsDiv.innerHTML = `
        <p>Add recipe to food logger?</p>
        <button id="addtoBreakfast-${recipeID}">Add to breakfast</button>
        <button id="addToLunch-${recipeID}">Add to lunch</button>
        <button id="addToDinner-${recipeID}">Add to dinner</button>
        <button id="addToSnacks-${recipeID}">Add to snacks</button>`;

    document.getElementById("results").appendChild(buttonsDiv);

    document.getElementById(`addtoBreakfast-${recipeID}`).addEventListener("click", () => addToMeal("breakfast"));
    document.getElementById(`addToLunch-${recipeID}`).addEventListener("click", () => addToMeal("lunch"));
    document.getElementById(`addToDinner-${recipeID}`).addEventListener("click", () => addToMeal("dinner"));
    document.getElementById(`addToSnacks-${recipeID}`).addEventListener("click", () => addToMeal("snacks"));

    
}

async function addToMeal(mealType) {
    try {
        const response = await fetch(`/addToMeal/${mealType}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(currentRecipe)
        });

        const result = await response.text();
        alert(result);
    } catch (error) {
        console.error("Error adding recipe:", error);
        alert("Failed to add recipe.");
    }
}