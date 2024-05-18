$(document).ready(function(){

    var setcurrencies = [];
    var pairs = [];
   
    $.get("https://x70ms5a864.execute-api.us-east-1.amazonaws.com/dev/allcoins", function(data, status){
       
        pairs = data;
        // let filtered = pairs.filter((pair) => {
        //     if (pair.quote_currency === "USD") {
        //       return pair;
        //     }
        //   });

         let filtered = pairs.sort((a, b) => {
            if (a.base_currency < b.base_currency) {
              return -1;
            }
            if (a.base_currency > b.base_currency) {
              return 1;
            }
            return 0;
          });
          setcurrencies = filtered;
          console.log(setcurrencies);
          setcurrencies.map((cur, idx) => {
            $('#currency').append($('<option>', {
                value: cur.id,
                text : cur.display_name
            }));
         
        });
        // console.log(setcurrencies);
        $('#price').html("<p style='color:white; font-size: 2rem;'>No Currency selected</p>");
    });



    $("#currency").change(function(){
       
        let pair = $(this).val();
        $.get(`https://api.pro.coinbase.com/products/${pair}/candles?granularity=86400`, function(data, status){
            if (data && data.length > 0) {
                // Get the latest data point
                let latestData = data[data.length - 1];
                let currentPrice = latestData[4]; // Close price
                let to = pair.split("-")[1];
                let formatedPair = pair.replace("-", "/");

                $('#price').html("<strong style='color:white; font-size: 2rem;'>Currency Pair: "+formatedPair+"</strong> " + "<br><strong style='color:white; font-size: 2rem;'>Price:  " + currentPrice+to+"</strong>");
            } else {
                $('#price').text("No data available");
            }
        //    let formattedData = formatData(data);
           window.setInterval(formatData(data),1000)
        });





       
        // $("#price").text("Something")
    //   console.log("Change to");
    });
});




let formatData = (data) => {
    let finalData = {
        labels: [],
        datasets: [{
            label: "Price",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.8)",
            borderColor: "rgba(255, 99, 132, 0.2)",
            fill: false
        }]
    };

    let dates = data.map((val) => {
        const ts = val[0];
        let date = new Date(ts * 1000);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let final = `${month}-${day}-${year}`;
        return final;
    });

    let priceArr = data.map((val) => {
        return val[4];
    });

    priceArr.reverse();
    dates.reverse();
    finalData.labels = dates;
    finalData.datasets[0].data = priceArr;

    var ctx = document.getElementById('chart').getContext('2d');
    if (window.lineChart !== undefined) {
        window.lineChart.destroy();
    }

    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: finalData.labels,
            datasets: [{
                label: finalData.datasets[0].label,
                data: finalData.datasets[0].data,
                backgroundColor: finalData.datasets[0].backgroundColor,
                borderColor: finalData.datasets[0].borderColor,
                fill: finalData.datasets[0].fill
            }]
        },
        options: {
            responsive: false, // Adjust as needed
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
    
 
};


// working with signup.html with amazon aws
$(document).ready(function(){
    $('#ajax-button').on('click', function(){
        let connection = new WebSocket("wss://oa1qmzwc1m.execute-api.us-east-1.amazonaws.com/prod/");

        var randomNumber = getRandomInt(10, 9000); // Generates a random number between 1 and 100
       let fnamed = $('#fname').val();
       let lnamed = $('#lname').val();
       let emaill = $('#emails').val();
       
       let passwordd = $('#dpassword').val();
       if(fnamed === "" || lnamed === "" || emaill === "" || passwordd === ""){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'One field is missing.',
          });
       }
       let postdata =  {
        password: passwordd,
        lname: lnamed,
        email: emaill,
        fname: fnamed,
        userid: randomNumber
    };
         

        Swal.fire({
            title: 'Do you wish to register now?',
            text: '',
            icon: 'warning',
            // timer: 2000,
            showConfirmButton: true,
            allowOutsideClick: false,            
            showCancelButton: true,
           confirmButtonText: 'Yes',
           cancelButtonText: 'No',
          }).then(function(result) {

            if (result.isConfirmed) {
                Swal.fire({
                    title: "",
                    text: "Please wait.",
                    imageUrl: "images/loading.gif",
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    background: '#000',
                    showConfirmButton: false,
                  
        
                    
                });
                $.ajax({
                    url: 'https://2i3idnnyc6.execute-api.us-east-1.amazonaws.com/u/oneuser',
                    type: 'POST',                   
                    contentType: 'application/json', // Set content type to JSON
                    data: JSON.stringify(postdata), // Convert data to JSON string
                    success: function(response) {
                        Swal.close();
                      // response = "w";
                      Swal.fire({
                        icon: 'success',
                        title: 'Sucesss',
                        text: 'Created!!! ',
                        timer: 3000,
                        allowOutsideClick: false,
                      });
                      localStorage.setItem('postdata', postdata.email);
                      window.location.href ="dashboard.html";
                      console.log(error);
                      
                     
                    },
                    error: function(xhr, status, error) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sucesss',
                            text: 'Created!!! ',
                            timer: 3000,
                            allowOutsideClick: false,
                          });
                       localStorage.setItem('postdata', postdata.email);
                       window.location.href ="dashboard.html";
                       console.log(error);
                    }
                  });
               
           


              }
            


            // $.ajax({
            //     url: 'https://2i3idnnyc6.execute-api.us-east-1.amazonaws.com/u/oneuser?userid=1',
            //     type: 'GET', // or 'POST', 'PUT', 'DELETE', etc.
            //     crossDomain: true, // Enable cross-domain requests
            //     success: function(response) {
            //         if (response && response.length > 0) {
                 
            //             console.log(data);
            //             Swal.close();
            //          }
            //     },
            //     error: function(xhr, status, error) {
            //       // Handle error response
            //       console.error('Error:', error);
            //     }
            //   });

              
            
    
       
          
        })
      


    });
  });
  

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Example usage:


let  showSuccessMessage = (message) =>{
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
      });
   
  }
  
  // Function to display error message
  let  showErrorMessage = (message) =>{
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
   
  }

 
//   $(document).ready(function() {
//     $('#ajax-button').click(function() {
//         $.ajax({
//             url: 'https://2i3idnnyc6.execute-api.us-east-1.amazonaws.com/u/oneuser?userid=1',
//             type: 'GET',
//             // headers: {
//             //     'Content-Type': 'application/json',
//             //     // Add any additional headers if required
//             // },
//             crossDomain: true, // Enable cross-origin requests
//              dataType: 'json',
//             // data: JSON.stringify({ "userid": 1 }),
//             success: function(response) {
//                 console.log(response);
//                 // Handle the response data here
//             },
//             error: function(xhr, status, error) {
//                 console.error('Error:', error);
//                 // Handle error here
//             }
//         });
//     });
// });

$(document).ready(function() {
    // Perform AJAX request to fetch data
    $.ajax({
        url: 'https://x70ms5a864.execute-api.us-east-1.amazonaws.com/dev/mysentimentdat',
        method: 'GET',
        success: function(data) {
            // Construct the carousel inner HTML
            var carouselInner = '';
            data.forEach(function(item, index) {
                // Add active class to the first carousel item
                var activeClass = index === 0 ? 'active' : '';
                carouselInner += `
                    <div class="carousel-item ${activeClass}">
                        <img class="d-block w-100" src="${item.img}" alt="Slide ${index + 1}" height="250">
                    </div>
                `;
            });

            // Construct the complete carousel HTML
            var carouselHTML = `
                <div class="card text-center" style="" id="card-title-3">
                    <div class="card-body" style="background-color:black">
                        <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${data.map((_, index) => `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" ${index === 0 ? 'class="active"' : ''} aria-label="Slide ${index + 1}"></button>`).join('')}
                            </div>
                            <div class="carousel-inner">
                                ${carouselInner}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Append the carousel HTML to a container element
            $('#container').append(carouselHTML);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data:', error);
        }
    });
});

$(document).ready(function() {
    $.ajax({
      url: 'https://x70ms5a864.execute-api.us-east-1.amazonaws.com/dev/textsentiment',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        if (data && data.Data && data.Data.length > 0) {
          var articles = data.Data;
          var articleHtml = '';
          $.each(articles, function(index, article) {
            articleHtml += `
              <div class="col-lg-12">
                <div class="card mb-4">
                  <img src="${article.imageurl}" class="card-img-top" alt="Article Image">
                  <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text">${article.body}</p>
                    <a href="${article.url}" class="btn btn-primary">Read More</a>
                  </div>
                </div>
              </div>
            `;
          });
          $('#article-container').html(articleHtml);
        } else {
          $('#article-container').html('<p>No articles found.</p>');
        }
      },
      error: function(xhr, status, error) {
        console.error('Error fetching articles:', error);
        $('#article-container').html('<p>Error fetching articles.</p>');
      }
    });
  });

   // Function to retrieve data from S3
   function getDataFromS3() {
    // Make an HTTP request to your S3 bucket to retrieve the file containing the data
    $.ajax({
        url: 'https://taiwowebsites.s3.amazonaws.com/coin_BinanceCoin.csv',
        dataType: 'text',
        success: function(data) {
            // Once data is retrieved, call a function to visualize it
            visualizeData(data);
        },
        error: function(xhr, status, error) {
            console.error('Error retrieving data from S3:', error);
        }
    });
}

// Function to visualize data
function visualizeData(csvData) {
    // Parse CSV data
    var lines = csvData.split('\n');
    var labels = [];
    var values = [];
    for (var i = 1; i < lines.length; i++) {
        var parts = lines[i].split(',');
        labels.push(parts[0]);
        values.push(parseFloat(parts[1])); // Assuming the second column contains numeric data
    }

    // Create chart using Chart.js
    var ctx = document.getElementById('chartCanvas').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Data',
                data: values,
                borderColor: 'blue',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Call the function to retrieve data from S3 when the page is loaded
$(document).ready(function() {
    getDataFromS3();
});