// Get the form element
const form = document.querySelector('#sign-up-form');

// Add a submit event listener to the form
form.addEventListener('submit', function(event) {
// Check if the form is valid
if (!form.checkValidity()) {
    // If the form is not valid, prevent the default submission and display an error message
    event.preventDefault();
    event.stopPropagation();
    form.classList.add('was-validated');
} else {
    // If the form is valid, submit the form
    // You can also perform additional processing here
}
});

// Add a change event listener to each form control that needs validation
for(let i = 1; i <= 3; i++){
    const input = document.querySelector('#input'+string(i));
    input.addEventListener('change', function(event) {
    // Check the validity of the input
    if (!input.checkValidity()) {
        // If the input is not valid, display an error message
        input.classList.add('is-invalid');
    } else {
        // If the input is valid, remove the error message (if any)
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }
    });
}