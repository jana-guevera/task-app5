
// ================================ Gloabal Variables ===================================
const addingLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
Adding...`;

const generalLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;


// ================================ Utility Functions ===================================

const showModal = (selector, options) => {
    $("label.error").hide();
    $(selector).modal("show");
}

const hideModal = (selector, options) => {
    $(selector).modal("hide");
}

const showSuccess = (message, options) => {
    toastr.success(message);
}

const showError = (message, options) => {
    toastr.error(message);
}

const showLoader = (selector, options) => {
    $(selector).html(options.content);
    $(selector)[0].disabled = true;
}

const hideLoader = (selector, options) => {
    $(selector).html(options.content);
    $(selector)[0].disabled = false;
}





