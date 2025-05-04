const searchBox = document.getElementById('searchBox');
const suggestions = document.getElementById('suggestions');

searchBox.addEventListener('input', async () => {
    const query = searchBox.value;
    if (query.length < 2) {
        suggestions.innerHTML = '';
        return;
    }
    const res = await fetch(`/autocomplete?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    suggestions.innerHTML = data.map(item => `<li><a href="/food/${item.id}">${item.name}</a></li>`).join('');

});