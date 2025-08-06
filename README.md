# PollStream

Real-time live voting and polling web application where users can create polls with multiple options and invite others to vote. 
Votes are updated live across all connected clients, and the results are displayed with visualizations like charts and percentages.

Tools: 
Python + Flask including SocketIO
html/css + JS 
Chart.js + boostrap 





<body>
        <form> 
            <h2>CODE: {{ poll_code }}</h2>
            <h3 id="hed3">Guide: Share this code with voters so they can join the poll</h3>
        </form> 
        <script> 
            const b1 = document.createElement("div");
            b1.innerHTML = `<button id="live" type="button">Show LiveChart</button>`   
            document.querySelector("form").appendChild(b1); 

            const id = JSON.parse('{{ poll_code | tojson | safe }}'); 
            document.getElementById("live").addEventListener("click", function() {   
                window.location.href = "/livechart?id=" + encodeURIComponent(id);   
            }); 
        </script>
    </body>





