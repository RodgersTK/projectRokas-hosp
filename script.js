//Start a new get request to run the server in the backend
const myRequest = new Request('http://localhost:3000/patients');

//Capture the html ids for manupulation 
const formOne = document.getElementById("formOne");
const searchPatientId = document.getElementById("search-patient-id");
const searchButton = document.getElementById("search-button");
const newPatientButton = document.getElementById("new-patient-button");
const newPatientToogler = document.getElementById("new-patient-toogler");
const formTwo = document.getElementById("formTwo");
const saveButton = document.getElementById("save-button");





//Taking user input from the new patient form and sending it to the server using post
formTwo.addEventListener('submit', event => {
    event.preventDefault();
    //Capture all form entries and store in a variable
    const newPatientName = document.getElementById("newPatientName").value;
    const newPatientId = document.getElementById("new-patient-id").value;
    const patientGender = document.getElementById("patient-gender").value;
    const patientAge = document.getElementById("patient-age").value;
    const patientNotes = document.getElementById("patient-notes").value;

    fetch('http://localhost:3000/patients', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            {
                name: newPatientName,
                identity: newPatientId,
                age: patientAge,
                gender: patientGender,
                notes: patientNotes
            })
    })
        .then((response) => response.json())
        .then(data => console.log(data))
});

//To display the new patient form
newPatientButton.addEventListener('click', () => {
    if (newPatientToogler.style.display === "none") {
        newPatientToogler.style.display = "block";
    }
    else {
        newPatientToogler.style.display = "none";
    }
});

//declaring variables for the update form 
const updatePatientToogler = document.getElementById("update-patient-toogler");

const updateForm = document.getElementById("update-form");

//To display the update patient form
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('patientId').value;
    const name = document.getElementById('patientName').value;
    const identity = document.getElementById('identity').value;
    const age = document.getElementById('patientAge').value;
    const gender = document.getElementById('patienGender').value;
    const notes = document.getElementById('patientNotes').value;

    // Construct the patient data object
    const data = {
        name: name,
        age: age,
        id: id,
        identity,
        gender: gender,
        notes: notes
    };


    try {
        // Send a PATCH request to the server to update the patient
        const response = await fetch('http://localhost:3000/update', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Check if the request was successful
        if (response.ok) {
            // Show a success message
            alert('Patient updated successfully!');
            setTimeout(function () { window.location.reload(); }, 2000)
        } else {
            // Show an error message
            alert('Failed to update patient. Please try again later.');
        }
    } catch (error) {
        console.error('Error updating patient:', error);
        // Show an error message
        alert('An unexpected error occurred. Please try again later.');
    }
});


//saving the changes made to the update 




function deletePatient(id) {
    fetch(`http://localhost:3000/delete?id=${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(responseText => {
            alert('Patient Deleted successfully')
            setTimeout(function () { window.location.reload(); }, 2000)
        })
        .catch(error => {
            console.error('Error deleting record:', error);
        });
}


async function updatePatient(id) {
    updatePatientToogler.style.display = "block";
    populateForm(await fetchPatientById(id))
}

async function fetchPatientById(id) {
    try {
        const response = await fetch(`http://localhost:3000/patient?id=${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch patient record');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching patient record:', error);
        throw error; // Re-throw the error to be caught by the calling code
    }
}

// Function to populate form fields with patient details
function populateForm(patient) {
    document.getElementById('patientName').value = patient.name;
    document.getElementById('patientId').value = patient.id;
    document.getElementById('patientAge').value = patient.age;
    document.getElementById('identity').value = patient.identity;
    document.getElementById('patienGender').value = patient.gender;
    document.getElementById('patientNotes').value = patient.notes;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const tableBody = document.getElementById('patient-table-body');

    function displayPatients(patients) {
        // Clear existing table data
        tableBody.innerHTML = '';

        // Populate table with new data
        patients.forEach(patient => {
            const newRow = tableBody.insertRow();
            newRow.innerHTML = `
        <td>${patient.id}</td>
        <td>${patient.name}</td>
        <td>${patient.identity}</td>
        <td>${patient.age}</td>
        <td>${patient.gender}</td>
        <td>${patient.notes}</td>
        <td class="flex gap 2">
          <button class="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"  onclick="deletePatient('${patient.id}')">Delete</button>
          <button class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" onclick="updatePatient('${patient.id}')">Update</button>
        </td>
      `;
        });
    }

    function filterPatients(searchQuery) {
        fetch('http://localhost:3000/hospdb.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const filteredPatients = data.patients.filter(patient => patient.name.toLowerCase().includes(searchQuery.toLowerCase()));
                displayPatients(filteredPatients);
            })
            .catch(error => {
                console.error('Error fetching JSON:', error);
            });
    }

    // Get a reference to the form element
    // const form = document.getElementById('update-form');

    // // Add an event listener to the form's submit event
    // form.addEventListener('submit', async function (event) {
    //     // Prevent the default form submission behavior
    //     event.preventDefault();

    //     // Call the updatePatient function
    //     await updatePatient();
    // });



    // async function updatePatient() {
    //     const id = document.getElementById('PatientId').value;
    //     const name = document.getElementById('patientName').value;
    //     const identity = document.getElementById('identity').value;
    //     const age = document.getElementById('patientAge').value;
    //     const gender = document.getElementById('patienGender').value;
    //     const notes = document.getElementById('patientNotes').value;

    //     const data = {
    //         id: id,
    //         name: name,
    //         identity: identity,
    //         age: age,
    //         gender: gender,
    //         notes: notes
    //     };

    //     try {
    //         const response = await fetch('http://localhost:3000/update', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(data)
    //         });

    //         if (response.ok) {
    //             const result = await response.text();
    //             alert(result); // Show success message
    //         } else {
    //             const errorMessage = await response.text();
    //             alert(errorMessage); // Show error message
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // }

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        const searchQuery = searchInput.value.trim();
        filterPatients(searchQuery);
    });

    // Fetch and display patient data when page loads
    filterPatients('');
});
