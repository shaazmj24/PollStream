# PollStream

Real-time live voting and polling web application where users can create polls with multiple options and invite others to vote. 
Votes are updated live across all connected clients, and the results are displayed with visualizations like charts and percentages.

Tools: 
Python + Flask including SocketIO
html/css + JS 
Chart.js + boostrap 




voters will use the same link (admin), same flask server. 

disploy app




<h1 id="h">  
            <span>Poll</span>
            <span>Stream</span>
        </h1>
        <div id="buttons"> 
            <button onclick="location.href='/create'">Create Poll</button>
            <button onclick="location.href='/join'">Join Poll</button>
        </div>


{% for option in code["options"] %}  
            <input type="radio" value="{{loop.index0}}" name="vote">  
            {{ option }} <br> 
            {% endfor %}



button { 
    position: relative; 
    background-color: black;
    color: white; 
    border: none;
    padding: 10px 15px;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    top: 54px; 
  }


{% for option in code["options"] %}  
            <label id="cl" class="option"> 
                <input type="radio" value="{{loop.index0}}" name="vote"> 
                <span class="circle">A</span> {{ option }} 
            </label>  
            {% endfor %} 


@app.route('/chart', method=['POST', 'GET'])
def chart(): 
    return "stub"



<!DOCTYPE html>
<html lang="en">  
    <head>
        <title>Chart</title>
    </head>
    <body> 
        <script>scr="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"</script>
        <canvas id="myChart" style="width:100%;max-width:700px"></canvas>
        <script>   
            const myChart = new Chart("myChart", { 
                type: "bar", 
                data: {}, 
                options: {} 
            });
        </script>
        <h1> 
            {{ selected }}
            {{choice}}
        </h1>
    </body>
</html>