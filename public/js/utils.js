// Credits to nblackburn for this function.
// https://gist.github.com/nblackburn/875e6ff75bc8ce171c758bf75f304707
function camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().replace(/ /g, '-');
}

function firstLetterUppercase(str) {
    return str.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}
