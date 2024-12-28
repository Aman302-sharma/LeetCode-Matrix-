document.addEventListener('DOMContentLoaded', function () {
    const searchbtn = document.getElementById('search-btn');
    const userNameinput = document.getElementById('user-input');
    const statcontainer = document.querySelector('.statContainer');
    const easyProgress = document.querySelector('.easy-progress');
    const mediumProgress = document.querySelector('.medium-progress');
    const hardProgress = document.querySelector('.hard-progress');
    const easyLabel = document.getElementById('easy-label');
    const mediumLabel = document.getElementById('medium-label');
    const hardLabel = document.getElementById('hard-label');
    const statCard = document.querySelector('.stats-cards');

    function validateUserName(userName) {
        if (userName.trim() === "") {
            alert('Please enter a valid username');
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const ismatching = regex.test(userName);
        if (!ismatching) {
            alert('Please enter a valid username');
            return false;
        }
        return ismatching;
    }

    function updateProgress(solved,total,label,circle){
        const progressDergree= (solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressDergree}%`);
        label.textContent=`${solved}/${total}`;



    }
    function displayUserData(parsedData) {
        const totalQues= parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues= parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues= parsedData.data.allQuestionsCount[2].count;
        const totalHardQues= parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues= parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedeasyQues= parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues= parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues= parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;


        updateProgress(solvedeasyQues,totalEasyQues,easyLabel,easyProgress);
        updateProgress(solvedMediumQues,totalMediumQues,mediumLabel,mediumProgress);
        updateProgress(solvedHardQues,totalHardQues,hardLabel,hardProgress);

        const cardData=[
            {label:'Overall Submissions:',value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label:'Overall EasySubmissions:',value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label:'Overall MediumSubmissions:',value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label:'Overall HardSubmissions:',value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
        ];

        console.log(cardData);
        statCard.innerHTML = cardData.map(
            data => 
                    `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div>`
        ).join("");
        
    }
    async function fetchUserDetails(username) {
        try {
            searchbtn.textContent = 'Searching...';
            searchbtn.disabled = true;
            //used proxy url as this is a CORS request and leetcode was blocking the request
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';
            
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };
            //concatenating proxy url and target url to make the request to leetcode it will first got to proxy server and then proxy sen the target url to leetcode server
            const response = await fetch(proxyUrl+targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error('Unable to fetch User Details');
            }
            const parsedData = await response.json();
            console.log(parsedData);
            //to show data on UI   
            displayUserData(parsedData);
        }
        catch (error) {
            statcontainer.innerHTML = `<p>${error.message}</p>`
        }
        finally {
            searchbtn.textContent = 'Search';
            searchbtn.disabled = false;
        }


    }

    searchbtn.addEventListener('click', function () {
        const username = userNameinput.value;
        if (validateUserName(username)) {
            fetchUserDetails(username);
        }
    });

});