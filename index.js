import Model from './model.js';

let m = new Model();
let allQuestions = m.getAllQstns();

window.onload = function() {
  document.getElementById("num-questions").innerHTML = allQuestions.length + " questions";
  /*Selects the buttons that lead to "different" pages*/
  var buttons = document.querySelectorAll(".pageButtons");
  const showQuestionsButton = document.getElementById("show-questions");
  changeColor(showQuestionsButton);
  const showTagsButton = document.getElementById("show-tags");
  const form = document.getElementById("form-container");
  const bottomTags = document.getElementById("tags");
  const answersPage = document.getElementById("answers-page");
  const displayAnswers = document.getElementById("display-answers");
  const answerQuestionBtn = document.getElementById("ansQuestionButton");
  const answerForm = document.getElementById("answerForm-container");
  const answerQnUsrName = document.getElementById("answer-username-textbox");
  const answerQnTextbox = document.getElementById("answer-add-details-textbox");
  const userNameErrorCheck = document.getElementById("answerForm-name-check");
  const answerTextboxErrorCheck = document.getElementById("answerForm-textBox-check");
    
  const sections = document.querySelectorAll(".section");


  /*Displays questions already in the model*/
  for(let question of allQuestions){
    createPost(question);
  }
  sortQuestions("newest");
      
  answerQuestionBtn.addEventListener("click", function(){
    const sectionId = "answerForm-container";
    let userNameTextbox = document.getElementById("answer-username-textbox");
    let answerTextbox = document.getElementById("answer-add-details-textbox");
    //clear values when its pressed
    userNameTextbox.value = '';
    answerTextbox.value = '';
    userNameErrorCheck.style.display = 'none';
    answerTextboxErrorCheck.style.display = 'none';

    if (answersPage.style.display !== "block") {  
      resetColor();
      toggleSection(sectionId);
      toggleExcept(sectionId);
    }
  });

  /*Event listener for turning on dark mode for the webpage*/
  const darkMode = document.getElementById("dark-mode");
  darkMode.addEventListener("click", function(){
    let element = document.body;
    element.classList.toggle("dark");
    let header = document.getElementById("header");
    if (element.classList.contains("dark")){
      header.style.background = "#202124";
    }
    else {
      header.style.background = "lightgray";
    }
  })

  function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.toggle("hidden");
  }

  function toggleExcept(sectionId) {
    for (var i = 0, n = sections.length; i < n; i++) {
      /*If it is not the section we want to show and it is not hidden*/
      if (sections[i].id !== sectionId && !sections[i].classList.contains("hidden")) {
        toggleSection(sections[i].id);
      }
    }
  }
  /*Shows and hides whats necessary for the questions content page*/
  showQuestionsButton.addEventListener("click", function(){
    const sectionId = "questions-section";
    if (showQuestionsButton.style.background !== "gray") {
      resetColor();
      resetQForum();
      changeColor(showQuestionsButton);
      toggleSection(sectionId);
      toggleExcept(sectionId);
    } else {
      return;
    }
  });

  /*Shows and hides whats necessary for the tags page*/
  showTagsButton.addEventListener("click", function(){
    const sectionId = "tags-section";
    if (this.style.background !== "gray") {
      resetColor();
      changeColor(this);
      toggleSection(sectionId);
      toggleExcept(sectionId);
      let numTags = document.getElementById("num-tags");
      numTags.innerText = m.getTagAmount() + " Tags";
      updateNumTags();
      var tagLinks = document.querySelectorAll(".tag-names");
      /*Use let here to save the i as a closure type of thing*/
      for (let i = 0, n = tagLinks.length; i < n; i++) {
        tagLinks[i].addEventListener("click", function () {
          const tagName = m.getTag(tagLinks[i].id).name;
          resetQForum();
          sortBySearch(filterQuestionsByTag(tagName));
        });
      }
    } else {
      return;
    }
  });

  function createTag(tid, tname){
    let tagAmount = countTagsPerQuestion(tid);

    let tagDiv = document.createElement("div");
    tagDiv.className = "tag-div";

    let tagName = document.createElement("h3");
    tagName.innerText = tname;
    tagName.className = "tag-names";
    tagName.id = tid;

    let amntofTags = document.createElement("h3");
    amntofTags.id = tid + "tag-amount"
    amntofTags.className = "amountOfTags";
    amntofTags.innerText = tagAmount + (tagAmount === 1? " question" : " questions");

    tagDiv.append(tagName, amntofTags);
    bottomTags.append(tagDiv);
  }

  function countTagsPerQuestion(tagID){
      let tagAmnt = 0;
      for(let question of allQuestions){
        for(let tag of question.tagIds){
          if(tagID === tag){
            tagAmnt++;
          }
        }
      }
      return tagAmnt;
  }

  function updateNumTags(){
    let tagNames = document.querySelectorAll(".tag-names");
    tagNames.forEach(tagNum => {
      let newTagNum = countTagsPerQuestion(tagNum.id);
      let tagAmount = document.getElementById(tagNum.id + "tag-amount");
      tagAmount.innerText = newTagNum + (newTagNum === 1? " question" : " questions");
    })
  }

  /*Used to highlight the current page you are on*/
  function changeColor(buttonId){
    buttonId.style.background = 'gray';
    buttonId.style.fontWeight = 'bold';
  }

  /*Resets the coloring for the page buttons*/
  function resetColor(){
    buttons.forEach(button => {
      button.style.background = 'transparent';
      button.style.fontWeight = 'normal';
    });
  }

 /* Make a toggle form so its more convenient */
  const askQnButtons = document.querySelectorAll(".ask-questions-button");

  for (let i = 0, n = askQnButtons.length; i < n; i++) {
    askQnButtons[i].addEventListener("click", function(){
      clearQForm();
      resetFormErrors();
      const sectionId = "form-container";
      if (form.style.display !== "block") {
        resetColor();
        toggleSection(sectionId);
        toggleExcept(sectionId);
      }
    });
  }
    // questionsSection.style.display = "none";
    // tagsSection.style.display = "none";
    // answersPage.style.display = 'none';
    // form.style.display = "block";
  
  /*Posting questions functions*/
  let postQn = document.getElementById("post-button");
  postQn.addEventListener("click", function(event) {
    let titleBox = document.getElementById("title-textbox");
    let textBox = document.getElementById("add-details-textbox");
    let nameBox = document.getElementById("username-text-box");
    let tagBox = document.getElementById("tags-textbox");

    const newTagNames = tagBox.value.trim().split(/\s+/);

    let tagErrorFlag = 0;
    newTagNames.forEach(newTag => {
      if (newTag.length > 20) {
        tagErrorFlag = 1;
      }
    });

    if(titleBox.value.length > 100 || titleBox.value.trim() === "" || nameBox.value.trim() === "" 
      || tagErrorFlag === 1 || newTagNames.length === 0 || newTagNames.length > 5) {
        resetFormErrors();
        if (titleBox.value.length > 100 || titleBox.value.trim() === "") {
          const error = document.getElementById("ask-question-title-error");
          error.style.display = "block";
        }
        if (nameBox.value.trim() === "") {
          const error = document.getElementById("ask-question-name-error");
          error.style.display = "block";
        }
        if (tagErrorFlag === 1 || newTagNames == '' || newTagNames.length > 5) {
          const error = document.getElementById("ask-question-tags-error");
          error.style.display = "block";
        }
    }
    else{
      resetFormErrors();
      const newQuestion = {
        qid: `q${allQuestions.length + 1}`,
        title: titleBox.value,
        text: textBox.value,
        tagIds: [],
        askedBy: nameBox.value,
        askDate: new Date(),
        ansIds: [],
        views: 0,
      }

      let currentTags = m.getAllTags();
      newTagNames.forEach(newTag => {
        /*If tag exists in the model already (case insensitive)*/
        let existingTag = currentTags.find(existedTag => existedTag.name.toLowerCase() === newTag.toLowerCase());
        /*If the tag is already found in the model and the newQuestion does not include the tagId already then add it*/
        if (existingTag && newQuestion.tagIds.indexOf(existingTag.tid) === -1) {
          newQuestion.tagIds.push(existingTag.tid);
        /*If the tag is not found meaning it is not a duplicate, create a new tag and corresponding tagId and push respectively*/
        } else if (!existingTag) {
          let newTagId = `t${currentTags.length + 1}`;
          newQuestion.tagIds.push(newTagId);
          m.data.tags.push({tid: newTagId, name: newTag});
        }
      });
      allQuestions.push(newQuestion);
      createPost(newQuestion);
      resetQForum();
      document.getElementById("num-questions").innerHTML = allQuestions.length + " questions";
      /*Get rid of errors after a post*/
      clearQForm();
      const sectionId = "questions-section";
      if (showQuestionsButton.style.background !== "gray") {
        resetColor();
        resetQForum();
        changeColor(showQuestionsButton);
        toggleSection(sectionId);
        toggleExcept(sectionId);
    }
  }
  });
  function clearQForm() {
    let titleBox = document.getElementById("title-textbox");
    let textBox = document.getElementById("add-details-textbox");
    let nameBox = document.getElementById("username-text-box");
    let tagBox = document.getElementById("tags-textbox");
    //clears the values in text after post is created
    const inputs = [titleBox, textBox, nameBox, tagBox];
    inputs.forEach(input => input.value = '');
  }
  function resetFormErrors () {
    const allErrors = document.querySelectorAll(".form-error-checks");
    allErrors.forEach(error => {
      error.style.display = "none";
    });
  }
  let postAnswerBtn = document.getElementById("postAnswer");
  
  postAnswerBtn.addEventListener("click", function(event){
    if(answerQnUsrName.value.length === 0 || answerQnTextbox.value.length === 0){
      event.preventDefault();
      if(answerQnUsrName.value.length===0){
        userNameErrorCheck.style.display = 'block';
        
      }
      else{
        userNameErrorCheck.style.display = 'none';
      }

      if(answerQnTextbox.value.length===0){
        answerTextboxErrorCheck.style.display = 'block';
        
      }
      else{
        answerTextboxErrorCheck.style.display = 'none';
      }
      return;
      
    }
    else{
      let questionTitle = document.getElementById("answersPageQnTitle");
      
      let qid = questionTitle.className;
      event.preventDefault();
      let questionMap = new Map();
      m.getAllQstns().forEach(qn=>questionMap.set(qn.qid, qn)); 
      const question = questionMap.get(qid);
      question.ansIds.push("a"+(m.getAllAnswers().length+1));

      //get qid of the question this is replying to and append the aid to the ansIds
      const ansObject = {
        aid: "a"+ (m.getAllAnswers().length+1),
        text: answerQnTextbox.value,
        ansBy: answerQnUsrName.value,
        ansDate: new Date()
      }
      m.getAllAnswers().push(ansObject); //pushing new answer into the answers
      //clear values after
      const inputs = [answerQnUsrName, answerQnTextbox];
      inputs.forEach(input => input.value = '');
      const sectionId = "answers-page";
      // toggleSection(sectionId);
      // toggleExcept(sectionId);
      userNameErrorCheck.style.display = 'none';
      answerTextboxErrorCheck.style.display = 'none';
      openAnswers(qid);
      openQuestion(qid);
      }
  });

  /*Creating individual posts dynamically*/
  function createPost(question){
    const post = document.createElement("div");
    post.className = "question-div";
    post.id = question.qid;

    const answersViewsDiv = document.createElement("div");
    answersViewsDiv.className = "ansViews";

    /*The num and views div of a question post*/
    const numAnswers = document.createElement("p");
    numAnswers.innerHTML = question.ansIds.length + " answers";
    numAnswers.classList.add("q-descriptions", "numAnswers");
    const numViews = document.createElement("p");
    numViews.innerHTML = question.views + " views";
    numViews.classList.add("q-descriptions", "numViews");
    answersViewsDiv.append(numAnswers, numViews);
    post.appendChild(answersViewsDiv); //adds div to post div

    const questionsForum = document.getElementById("questions-forum");
    const titleAndTags = document.createElement("div");
    titleAndTags.className = "titleTags-div";
    const title = document.createElement("h3");
    title.innerHTML = question.title;
    title.className = "postTitle";

    title.addEventListener("click", function(){
      numViews.innerText = incrementView(post.id) + " views";
      openQuestion(post.id);
      openAnswers(post.id);
    });

    titleAndTags.appendChild(title);

    const tagContainer = document.createElement("div");
    tagContainer.className = "tagContainer";
    question.tagIds.forEach(tagId => {
      const tag = document.createElement("span");
      let tagInfo = m.data.tags.find(existingTag => existingTag.tid === tagId);
      tag.innerHTML = tagInfo.name;
      tag.className = "postTags";
      tagContainer.appendChild(tag);
      const tagTracker = document.getElementById(tagId);
      /*If the tag tracker was not already created in the tags page*/
      if (!tagTracker) {
        createTag(tagId, tagInfo.name);
      }
    });
    titleAndTags.appendChild(tagContainer);
    post.appendChild(titleAndTags);
    
    const userInfo = document.createElement("div");
    userInfo.className = "user-info";
    const userName = document.createElement("span");
    userName.innerHTML = question.askedBy;
    userName.className = "askedUser";

    const askedInfo = document.createElement("span");
    askedInfo.innerHTML = " asked " + calculateDate(question.askDate);
    askedInfo.className = "askedInfo";
    askedInfo.id = question.qid + "-askedInfo";
    userInfo.appendChild(userName);
    userInfo.appendChild(askedInfo);
    post.appendChild(userInfo);
    questionsForum.appendChild(post);
  };

  /*Helper function for the create post function*/
  function calculateDate(questionDate){
    let currentDate = new Date();
    let timeDifferenceInSeconds = Math.floor((currentDate - questionDate)/1000);
    // Time difference less than a day
    if (timeDifferenceInSeconds < 24 * 60 * 60 && timeDifferenceInSeconds >= 0) {
      const minutes = Math.floor(timeDifferenceInSeconds/60);
      const hours = Math.floor(timeDifferenceInSeconds/3600);
      if (minutes === 0) {
        // Posted less than 1 minute ago
        return timeDifferenceInSeconds === 0? ` just now`: timeDifferenceInSeconds === 1? ` ${timeDifferenceInSeconds} second ago` :` ${timeDifferenceInSeconds} seconds ago`;
      }
      else if (hours === 0) {
        return minutes === 1? ` ${minutes} minute ago`: ` ${minutes} minutes ago`;
      }
      else {
        return hours === 1? ` ${hours} hour ago`: ` ${hours} hours ago`;
      }
    }
    else if (timeDifferenceInSeconds < 24 * 60 * 60 * 365 && timeDifferenceInSeconds >= 0) {
      // Posted over a day
      return questionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) + " at " + questionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    else {
      // Posted over a year ago
      return questionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + " at " + questionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  }
  /*code for the category links*/
  let catLinks = document.querySelectorAll(".category-link");
  let newestCat = catLinks[0];
  let activeCat = catLinks[1];
  let unansweredCat = catLinks[2];
  newestCat.addEventListener("click", () => {
    /*Fix the highlighted category color*/
    resetQForum();
    newestCat.style.background = "gray";
    /*Nest inside anonymous function as eventListener requires a function reference not an invocation*/
    sortQuestions("newest");
  });
  activeCat.addEventListener("click", () => {
    /*Fix the highlighted category color*/
    resetQForum();
    activeCat.style.background = "gray";
    sortQuestions("active");
  });
  unansweredCat.addEventListener("click", () => {
    /*Fix the highlighted category color*/
    resetQForum();
    unansweredCat.style.background = "gray";
    sortQuestions("unanswered");
  });

  function sortQuestions(category) {
    const questionsForum = document.querySelector("#questions-forum");
    const questionsList = [...questionsForum.children].filter(element => element.nodeName != "H3");
    /*Spread syntax to convert from HTMLCollection to array for sorting, appendChild() here move the existing child to a new position*/
    if (category === "newest") {
      allQuestions.sort((q1, q2) => q1.askDate > q2.askDate ? -1: 1);
      /*Gets the currentQids in the model after sorting the questions array based on more recent askDate*/
      const currentQIds = allQuestions.map(question => question.qid);
      questionsList.sort((q1, q2) => currentQIds.indexOf(q1.id) < currentQIds.indexOf(q2.id) ? -1: 1)
      .forEach(question => questionsForum.appendChild(question));
    }
    else if (category === "active") {
      /*See which question has the ansId of the most recent answer by time*/
      allQuestions.sort((q1, q2) => {
        let winner = 0;
        let earliestWinner = 0;
        for (let ansId of q1.ansIds) {
          if (m.getAnswer(ansId).ansDate > earliestWinner) {
            earliestWinner = m.getAnswer(ansId).ansDate;
            winner = -1;
          }
        }
        for (let ansId of q2.ansIds) {
          if (m.getAnswer(ansId).ansDate > earliestWinner) {
            earliestWinner = m.getAnswer(ansId).ansDate;
            winner = 1;
          }
        }
        return winner;
      });
      /*Gets the currentQids in the model after sorting the questions array based on more recent askDate*/
      const currentQIds = allQuestions.map(question => question.qid);
      questionsList.sort((q1, q2) => currentQIds.indexOf(q1.id) < currentQIds.indexOf(q2.id) ? -1: 1)
      .forEach(question => questionsForum.appendChild(question));
    }
    else if (category === "unanswered") {
      const currentQIds = allQuestions.map(question => {
        if (question.ansIds.length === 0) {
          return question.qid;
        }
      }).filter(question => question !== undefined); /*Ensure the list if empty no undefines*/
      questionsList.forEach(question => {
        if (currentQIds.indexOf(question.id) != -1) {
          question.style.display = "flex"
        }
        else {
          question.style.display = "none";
        }
      });
      if (currentQIds.length === 0) {
        const noQHeader = document.getElementById("noQHeader");
        noQHeader.style.display = "block";

      }
      /*Update the number of questions in the current sort no matter what*/
      document.getElementById("num-questions").innerHTML = currentQIds.length + " questions";
    }
  }

  function resetNoQuestions() {
    const noQHeader = document.getElementById("noQHeader");
    if (noQHeader.style.display === "block") {
      noQHeader.style.display = "none";
    }  
  }
  /*The real time update should be done after any sorting*/
  function updateTime (){
    allQuestions.forEach(question => {
      /*Grab each individual distinct askedInfo of each post by their unique ID instead of class so reordering of sort does not affect correctness*/
      document.getElementById(question.qid + "-askedInfo").innerHTML = " asked " + calculateDate(question.askDate);
    });
  };
  
  function updateAnswers(){
    //converts to hashmap so not slow
    let questionMap = new Map();
    m.getAllQstns().forEach(qn=>questionMap.set(qn.qid, qn));
    
    let questionDivs = document.querySelectorAll(".question-div");
    //gets every div
    for(let questions of questionDivs){ //for every existing div 
      let qid = questions.id;
      let question = questionMap.get(qid);
      let updatedAnswers = questions.querySelector(".numAnswers");
      updatedAnswers.innerText = question.ansIds.length + " answers";
      
    }    
  }
  function resetQForum (){
    document.getElementById("num-questions").innerHTML = allQuestions.length + " questions";
    document.getElementById("all-questions-text").innerHTML = "All Questions";
    updateAnswers();
    sortQuestions("newest");
    updateTime();
    resetNoQuestions();
    resetCatColors();
    allQuestions.forEach(question => {
      let questionDiv = document.getElementById(question.qid);
      if (questionDiv.style.display === "none") {
        questionDiv.style.display = "flex";
      }
    });
  }

  function resetCatColors() {
    [...document.getElementsByClassName("category-link")].forEach(cat => cat.style.background = "white");
  }

  function hideQuestions (){
    allQuestions.forEach(question => {
      let questionDiv = document.getElementById(question.qid);
      questionDiv.style.display = "none";
    });
  }
  
  const searchBar = document.getElementById("searchbar");
  searchBar.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
      resetQForum();
      /*Only white lines after one continuous word? so shouldnt split by all whitespaces consider [ javascript ]?*/
      const searchValues = searchBar.value.trim().split(" ");
      if (searchValues != '') {
        processSearch(searchValues);
        searchBar.value = '';
      }
      else {
        document.getElementById("all-questions-text").innerHTML = "Search Results";
        invalidSearch();
      }
    } 
  })

  function invalidSearch (){
    document.getElementById("num-questions").innerHTML = "0 questions";
    const noQHeader = document.getElementById("noQHeader");
    noQHeader.style.display = "block";
    hideQuestions();
    const sectionId = "questions-section";
    if (showQuestionsButton.style.background !== "gray") {
      resetColor();
      changeColor(showQuestionsButton);
      toggleSection(sectionId);
      toggleExcept(sectionId);
    }
  }
  function sortBySearch(questions) {
    hideQuestions();
    questions.forEach(question => {
      let questionDiv = document.getElementById(question.qid);
      if (questionDiv) {
        questionDiv.style.display = "flex";
      }
    });
    const sectionId = "questions-section";
    if (showQuestionsButton.style.background !== "gray") {
      resetColor();
      changeColor(showQuestionsButton);
      toggleSection(sectionId);
      toggleExcept(sectionId);
    }
    /*Takes only the first occurence*/
    const uniqueQuestions = questions.filter((question, index) => questions.indexOf(question) === index);
    document.getElementById("all-questions-text").innerHTML = "Search Results";
    document.getElementById("num-questions").innerHTML = uniqueQuestions.length + " questions";
  }

  function processSearch(searchValues) {
    const tagRegex = /^\[.*\]/;
    let displayQuestions = [];
    searchValues.forEach(value => {
      if (tagRegex.test(value)) {
        let questionsFound = filterQuestionsByTag(value.substring(1, value.length - 1));
        questionsFound.forEach(question => displayQuestions.push(question));
      }
      else {
        let questionsFound = filterQuestionsByText(value);
        questionsFound.forEach(question => displayQuestions.push(question));
      }
    });
    document.getElementById("all-questions-text").innerHTML = "Search Results";
    if (displayQuestions.length === 0) {
      invalidSearch();
    }
    else {
      sortBySearch(displayQuestions);
    }
  }
  function filterQuestionsByTag(searchTag) {
    const allTags = m.getAllTags();
    let questionsFound = []
    let tagId = "";
    allTags.forEach(tag => {
      if (tag.name.toLowerCase() === searchTag.toLowerCase()) {
        tagId = tag.tid;
      }
    });
    allQuestions.forEach(question => {
      if (question.tagIds.indexOf(tagId) !== -1) {
        questionsFound.push(question);
      }
    });
    return questionsFound;
  }

  function filterQuestionsByText(text) {
    let questionsFound = []
    let lowerText = text.toLowerCase();
    allQuestions.forEach(question => {
      if (question.text.toLowerCase().includes(lowerText) || question.title.toLowerCase().includes(lowerText)) {
        questionsFound.push(question);
      }
    });
    return questionsFound;
  }

  function openQuestion(qid){
    resetColor();
    toggleSection("answers-page");
    toggleExcept("answers-page");
    
    let questionTitle = document.getElementById("answersPageQnTitle");
    let questionText = document.getElementById("questionDescription")
    let questionViews = document.getElementById("ansQnViews");
    let questionAnswers = document.getElementById("ansQnAns");
    let user = document.getElementById("askedUser"); 
    let time = document.getElementById("askedTime" );
    questionTitle.className = qid;

      for(let qn of m.getAllQstns()){
      if(qid === qn.qid){
        questionTitle.innerText = qn.title;
        questionText.innerText = qn.text;
        questionViews.innerText = qn.views + " views";
        questionAnswers.innerText = qn.ansIds.length +" answers";
        user.innerText = qn.askedBy;
        time.innerText = " asked " + calculateDate(qn.askDate);
        
    }
  }
}
function openAnswers(qid){
  let questionMap = new Map();

  m.getAllQstns().forEach(qn=>questionMap.set(qn.qid, qn));
  const question = questionMap.get(qid);
  try{
    let preExistingDivs = document.querySelectorAll(".answerTextDiv");
    for(let div of preExistingDivs){
      div.remove();
    }
  }
  catch(error){
    console.log(error);
  }
  for(let ansId of question.ansIds){  
    createAnswer(ansId);
  }
  
}
function createAnswer(ansId){
  let ansText = m.getAnswer(ansId).text;
  let answerTextDiv = document.createElement("div");
  let answerParagraph = document.createElement("p");
  let answerQnButton = document.getElementById("ansQuestionButton");
  let userAskDiv = document.createElement("div");
  let user = document.createElement("span");
  user.className = "ansUser";
  let time = document.createElement("span");
  time.className = "ansTime";
  user.innerText = m.getAnswer(ansId).ansBy;
  time.innerText = " answered " + calculateDate(m.getAnswer(ansId).ansDate);
  userAskDiv.append(user, time);
  answerParagraph.innerText = ansText;
  answerTextDiv.append(answerParagraph, userAskDiv);
  answerTextDiv.className = "answerTextDiv";
  answerTextDiv.id = ansId;
  displayAnswers.insertBefore(answerTextDiv, answerQnButton);
}

function incrementView(qid){
  let updatedViews;
    for(let qn of m.data.questions){
      if(qid === qn.qid){
        qn.views++;
        updatedViews = qn.views;
        break;
      }
    }
    return updatedViews;
}

};


