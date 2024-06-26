// Declaring global variables
let answered = false;
let toSend;
let topicID;

// Function to fetch questions:
function fetchQuestion(toSend) {
    // Promise for data retrieval from server:
    return new Promise((resolve, reject) => {
        // Fetching question contents
        fetch('http://localhost:3000/sessionData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toSend)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok');
            })
            .then(data => {
                console.log(data);
                // Saving question data to local storage
                localStorage.setItem('questionData', JSON.stringify(data));
                window.location.href = "revise.html"; // Redirect to revise.html
                // Resolve the Promise when data is successfully set
                resolve();
            })
            .catch(error => {
                console.error('There has been an error:', error);
                // Reject the Promise if there's an error
                reject(error);
            });
    });
}
// Fetching a question from the AI
function fetchAi(toSend) {
    // Promise that toSend will be fufilled
    return new Promise((resolve, reject) => {
        fetch('http://localhost:3000/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toSend)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                // Server side error ( Connection Failed )
                throw new Error('Network response was not ok')
            })
            .then(data => {
                console.log(data);
                localStorage.setItem('AiQuestion', JSON.stringify(data));
                // Redirection to question page:
                window.location.href = "ai.html"
            })
    })
}
document.addEventListener('DOMContentLoaded', function () {
    // Selecting all the buttons:
    const buttons = document.querySelectorAll('.btn');

    // Looping through all the buttons to see if they were clicked or not:
    buttons.forEach(button => {
        // If a button has been clicked:
        button.addEventListener('click', function (event) {
            // Log the clicked button
            console.log(`User has clicked ${event.target.id}`);

            // If the user has clicked on the statistic page:
            if (event.target.id == "Statistics") {
                const email = localStorage.getItem('email');

                var toRequest = {
                    email: email
                };

                fetch('http://localhost:3000/statistics', { // Removed the extra closing parenthesis here
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(toRequest)
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }

                        console.log(data);
                        throw new Error('Network response was not ok');
                    })
                    .then(data => {
                        localStorage.setItem('userStatistics', JSON.stringify(data));
                        window.location.href = "statistics.html";
                    })
                    .catch(error => {
                        console.error('There has been an error:', error);
                    });
            }

            else if (event.target.id == "AI") {

                const email = localStorage.getItem('email')

                var toSend = {
                    email: email
                }

                fetchAi(toSend);
            }
            else {
                const topic = event.target.id;

                // Wrapping everything into an object:
                var toSend = {
                    topic: topic
                };

                // Using a POST request to send the variable to the user.
                fetchQuestion(toSend);
            }
        });
    });
});


// Looping through all the buttons for the click state:
const optionButtons = document.querySelectorAll('.option')
const explanationDiv = document.getElementById('explanation')

optionButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        const email = localStorage.getItem('email')
        //Looping through all the buttons and fetching their css styles
        optionButtons.forEach(b => b.style.backgroundColour = "");

        // Fetching explanation box (currently hidden):
        document.getElementById('explanation').style.display = 'none';

        // Get the selected option
        const selectedOption = event.target.id;
        console.log('Selected option:', selectedOption);

        const questionData = JSON.parse(localStorage.getItem('questionData'));
        // Send the selected option to the server
        fetch('http://localhost:3000/submitAnswer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                selectedOption,
                questionId: questionData.question_id,
                email: email
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Response from the server:
                if (data.isCorrect) {
                    answered = true;
                    event.target.style.backgroundColor = 'green';
                    // If the question is wrong:
                } else {
                    answered = true;
                    event.target.style.backgroundColor = 'red';
                    document.getElementById(data.correctAnswer).style.backgroundColor = 'green';

                    const explanationDiv = document.getElementById('explanation')

                    explanationDiv.textContent = `${data.reason}`
                    explanationDiv.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    });
});

// Get the "next" button
const nextbtn = document.getElementById('next-btn');

// Inside the 'nextbtn' event listener
nextbtn.addEventListener('click', function () {
    // Check if any option is selected
    if (!answered) {
        alert('Please select an option before marking.');
        return;
    } else {
        if (localStorage.getItem('questionData') !== null) {
            if (!toSend) {
                toSend = {};
            }
            toSend.topic = JSON.parse(localStorage.getItem('questionData')).topic;
            console.log(toSend)
            localStorage.removeItem('questionData');
            fetchQuestion(toSend)
                .then(() => {
                    optionButtons.forEach(b => {
                        b.disabled = false;
                        b.style.backgroundColor = "#e0e0e0"
                    });
                    explanationDiv.style.display = 'none'
                })
                .catch(error => {
                    console.error('Error fetching question:', error);
                });
        } else {
            console.error('Could not find requested item in local storage')
        }
    }
});

markBtn.addEventListener('click', function () {
    const answer = document.getElementById("answer").value.trim();
    const ai_data = localStorage.getItem('AiQuestion');
    const email = localStorage.getItem('email')

    fetch('http://localhost:3000/markAnswer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userAnswer: answer,
            question: ai_data,
            email: email
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if(data == "1"){
                localStorage.setItem('mark', "Correct!")
            } else {
                console.log(data)
                localStorage.setItem('mark', data)
            }
        })
})