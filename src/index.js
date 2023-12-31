import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import createMarkup from './markup.js'

const gallery = document.querySelector(".gallery")
const form = document.querySelector('.search-form')
const guard = document.querySelector('.guard')
const BASE_URL ="https://pixabay.com/api/"
const API_KEY = "41139869-f8379f77ee410072fd9aeb531"
let page = 1
let searchItem = ''
let maxPages 

const options = {
    root: null,
    rootMargin: "250px",
    threshold: 0
}

let lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });

form.addEventListener('submit', onSubmit)

const observer = new IntersectionObserver(handlePagination, options)

async function onSubmit(event) {
    event.preventDefault()
    page = 1
    gallery.innerHTML = ""
    lightbox.refresh();
    searchItem = event.currentTarget.elements.searchQuery.value
    try {
            const data = await getArray(searchItem, page)
            maxPages = Math.ceil(data.totalHits / 40)
    
        if (data.totalHits === 0 || searchItem.trim() === '') {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.")
        } else {
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`)
            gallery.insertAdjacentHTML("beforeend", createMarkup(data.hits))
        
        if (page < maxPages) {
            observer.observe(guard);
        }
        if (page >= maxPages) {
            observer.unobserve(guard)
            Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.")
        }
        }
    } catch (error) {
        console.log(error)
    }
    lightbox.refresh()
    form.reset()
}


async function getArray(category, page) {
    try {
        const response =  await axios(`${BASE_URL}?key=${API_KEY}&q=${category}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`)
        return response.data
    } catch (error) {
        alert("Error in fetching data", error)
    }
}

async function handlePagination(entries, observer) {
    if (entries[0].isIntersecting && page < maxPages) {
        try {
            page += 1
            const data = await getArray(searchItem, page)
            if (page <= maxPages) {
                gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits))
                lightbox.refresh();
            } else {
                observer.unobserve(guard)
            }
        } catch (error) {
            console.log('Error message', error)
        }
    }
    if (page >= maxPages) {
        observer.unobserve(guard)
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.")
    }
}
