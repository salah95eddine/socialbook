




// <---- Rest connection ----> //  
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
        // If the token and user exist, update the UI
        updateUIAfterLogin(user);
    }

    // Load posts or other necessary data
    if (document.getElementById("posts")) {
        getPosts();
    }

    // Load post details if necessary
    if (window.location.href.includes("postDetails.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get("postId");
        if (postId) {
            getPostDetails(postId);
        }
    }
});

function updateUIAfterLogin(user) {
    if (user) {
        // Update the username and profile image
        document.getElementById("username-home").innerHTML = user.name;

        document.getElementById("user-img").src = user.profile_image;
        
        // Show elements for logged-in users
        document.getElementById("registre-btn").classList.add("hide");
        document.getElementById("login-btn").classList.add("hide");
        document.getElementById("user-img").classList.remove("hide");
        document.getElementById("logout-btn").classList.remove("hide");
        document.getElementById("username-home").classList.remove("hide");
        document.getElementById("addPostBtn").classList.remove("hide");
        document.getElementById("add-comment-div").classList.remove("hide");
        

        
    } else {
        // Show elements for non-logged-in users
        document.getElementById("registre-btn").classList.remove("hide");
        document.getElementById("login-btn").classList.remove("hide");
        document.getElementById("user-img").classList.add("hide");
        document.getElementById("logout-btn").classList.add("hide");
        document.getElementById("username-home").classList.add("hide");
        document.getElementById("add-comment-div").classList.add("hide");
        
    }
}
// <---- Rest connection ----> //  

let currentPage = 1
let lastPage = 1

// -------------------------------------------------------------------------------------------
// <---- infinite scroll ----> //  

    window.addEventListener("scroll",function(){
        
        const endOfPage =window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
        if (endOfPage && currentPage < lastPage)
        {
            currentPage += 1
            getPosts(currentPage)
            
        }
              
    })
// -------------------------------------------------------------------------------------------
// <---- infinite scroll ----> // 

// <---- Get Posts ----> // 
function getPosts(page = 1){
    let url = `https://tarmeezacademy.com/api/v1/posts?limit=5&page=${page}`
    toggleLoader(true)
    axios.get(url)
    .then((response)=>{
        let posts = response.data.data
        lastPage = response.data.meta.last_page

        
        for (post of posts){
            let postsContainer = document.getElementById('posts');
            if (!postsContainer) return;  // Prevent error if element is missing hh

            // show or hide edit button
            let user = getCurrentUser()
            let isMyPost = user != null && post.author.id == user.id

            let editButtonContent = ""
            let deleteButtonContent = ""
            if (isMyPost) {
                editButtonContent = `<button class="btn btn-secondary" data-post="${encodeURIComponent(JSON.stringify(post))}" onclick="editPostBtnClicked(this)">Edit</button>`;
                deleteButtonContent = `<button class="btn btn-danger" data-post="${encodeURIComponent(JSON.stringify(post))}" onclick="deletePostBtnClicked(this)">Delete</button>`;
                
            }
            // ------ show or hide edit button

            postsContainer.innerHTML +=
            `<div class="card shadow p-3 mb-5 rounded" style="width: 80%; margin: auto; margin-top: 50px;">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-3 p-2" style="cursor:pointer;"  onclick="userClicked(${post.author.id})">
                        <img class="border border-primary" src="${post.author.profile_image}" alt=".." style="width: 40px;height: 40px; border-radius: 50%;">
                        <div class="fs-5 fw-medium" >${post.author.name}</div>
                    </div>
                    <div>
                        ${editButtonContent}
                        ${deleteButtonContent}
                    </div>
                </div>
                <img src="${post.image}" class="card-img-top rounded" alt="..">
                <h6 class="text-secondary p-1">${post.created_at}</h6>
                <div class="card-body card-body-home" onclick="getPostDetails(${post.id})">
                  <h5 class="card-title">${post.title}</h5>
                  <p class="card-text">${post.body}</p>
                  <hr>
                  <div>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16">
                            <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                            <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/>
                          </svg> (${post.comments_count}) comments 
                            <span id="post-tags-${post.id}"> 
                            </span>
                    </span>
                  </div>
                </div>
              </div>`
              const currentPostTagsId = `post-tags-${post.id}`
              document.getElementById(currentPostTagsId).innerHTML= ""
              for(tag of post.tags){
                let tagsContent = `
                <button type="button" class="btn btn-sm btn-secondary" disabled>${tag.name}</button>
                `
                document.getElementById(currentPostTagsId).innerHTML+= tagsContent
              }
        } 
    })
    .catch(error => {
        alert(error.response.data.message)
    }).finally(()=>{
        toggleLoader(false)
    })
}
getPosts()
// -------------------------------------------------------------------------------------------
// <---- Get Posts ----> // 

// <---- Login ----> // 
function loginBtnClicked(){
    const username = document.getElementById("usernameInput").value
    const password = document.getElementById("passwordInput").value
    
    
    const params = {
        "username": username,
        "password": password
    }
        let url = "https://tarmeezacademy.com/api/v1/login"
        toggleLoader(true)
        axios.post(url,params)
        .then((response)=>{
            
            let token = response.data.token
            let user = response.data.user

            localStorage.setItem("token",token)
            localStorage.setItem("user",JSON.stringify(user))

            const modal = document.getElementById("loginModal")
            const modalInstance = bootstrap.Modal.getInstance(modal)
            modalInstance.hide()

            showSuccessAlert()

            if(token == null){
                document.getElementById("registre-btn").classList.remove("hide");
                document.getElementById("login-btn").classList.remove("hide");
                document.getElementById("user-img").classList.add("hide");
                document.getElementById("logout-btn").classList.add("hide");
                document.getElementById("username-home").classList.add("hide");
                document.getElementById("add-comment-div").classList.add("hide");
                
            }else{
                document.getElementById("registre-btn").classList.add("hide");
                document.getElementById("login-btn").classList.add("hide");
                document.getElementById("user-img").classList.remove("hide");
                document.getElementById("logout-btn").classList.remove("hide");
                document.getElementById("username-home").classList.remove("hide");
                document.getElementById("addPostBtn").classList.remove("hide");
                document.getElementById("add-comment-div").classList.remove("hide");
                

                // Update the username and profile image
                document.getElementById("username-home").innerHTML = user.username;
                document.getElementById("user-img").src = user.profile_image;
            }
            
        })
        .catch(error => {
            alert(error.response.data.message)
        }).finally(()=>{
            toggleLoader(false)
        })
}
// -------------------------------------------------------------------------------------------
// <---- Login ----> // 

// <---- Registre ----> // 
function registreBtnClicked(){
    const name = document.getElementById("registreNameInput").value
    const username = document.getElementById("registreUsernameInput").value
    const password = document.getElementById("registrePasswordInput").value
    const image = document.getElementById("registrePhoto").files[0]
    
        let formData = new FormData() 

        formData.append("name",name)
        formData.append("username",username)
        formData.append("password",password)
        formData.append("image",image)

        const headers = {
            "Content-type":"multipart/form-data"
        }
        toggleLoader(true)
        axios.post("https://tarmeezacademy.com/api/v1/registre" , formData,{
            headers : headers
        })
        .then((response)=>{
            
            let token = response.data.token
            let user = response.data.user

            localStorage.setItem("token",token)
            localStorage.setItem("user",JSON.stringify(user))

            const modal = document.getElementById("registreModal")
            const modalInstance = bootstrap.Modal.getInstance(modal)
            modalInstance.hide()

            if(token == null){
                document.getElementById("registre-btn").classList.remove("hide");
                document.getElementById("login-btn").classList.remove("hide");
                document.getElementById("user-img").classList.add("hide");
                document.getElementById("logout-btn").classList.add("hide");
                document.getElementById("username-home").classList.add("hide");
                document.getElementById("add-comment-div").classList.add("hide");
                
            }else{
                document.getElementById("registre-btn").classList.add("hide");
                document.getElementById("login-btn").classList.add("hide");
                document.getElementById("user-img").classList.remove("hide");
                document.getElementById("logout-btn").classList.remove("hide");
                document.getElementById("username-home").classList.remove("hide");
                document.getElementById("addPostBtn").classList.remove("hide");
                document.getElementById("add-comment-div").classList.remove("hide");
                

                // Update the username and profile image
                document.getElementById("username-home").innerHTML = user.name;
                document.getElementById("user-img").src = user.profile_image;
            }
            showRegistreFailedAlert()  
        })
        .catch(error => {
            alert(error.response.data.message)
        }).finally(()=>{
            toggleLoader(false)
        })
}
// -------------------------------------------------------------------------------------------
// <---- Registre ----> // 



// <---- Logout ----> // 

function logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    setTimeout(()=>{
        location.reload();
    },1200)
    showLogoutSuccessAlert()
    
}
// -------------------------------------------------------------------------------------------
// <---- Logout ----> // 


// <---- Alerts  ----> //


// <---- Login success alert  ----> //

function showSuccessAlert(){
    const alertPlaceholder = document.getElementById('successAlert')
    
    const alert = (message, type) => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-success alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('')
    
      alertPlaceholder.append(wrapper)
    }
        alert('Login Successful')
        //hide this alert after 2seconds
        setTimeout(()=>{
            const alertClose = bootstrap.Alert.getOrCreateInstance('#successAlert')
            alertClose.close()
        },2000)
        
        
    
    }
    // --------------------------------------------------------------------------------------
    // <---- Login success alert  ----> //
    

    // <---- Logout success alert  ----> //
    
    function showLogoutSuccessAlert(){
    const alertPlaceholder = document.getElementById('logoutSuccessAlert')
    
    const alert = (message, type) => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-danger alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('')
    
      alertPlaceholder.append(wrapper)
    }
        alert('Logout Successful')
        //hide this alert after 2seconds
        setTimeout(()=>{
            const alertClose = bootstrap.Alert.getOrCreateInstance('#logoutSuccessAlert')
            alertClose.close()
        },2000)
        
        
    
    }
    //-------------------------------------------------------------------------------------------
    // <---- Logout success alert  ----> //


    // <---- Registre failed alert  ----> //
    
    
    function showRegistreFailedAlert(){
    const alertPlaceholder = document.getElementById('registreFailed')
    
    const alert = (message, type) => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-danger alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('')
    
      alertPlaceholder.append(wrapper)
    }
        alert("(API PROBLEM) Sorry ! You can't registre now , Try later")
        //hide this alert after 2seconds
        setTimeout(()=>{
            const alertClose = bootstrap.Alert.getOrCreateInstance('#registreFailed')
            alertClose.close()
        },6000)
        
        
    
    }
    // -----------------------------------------------------------------------------
    // <---- Registre failed alert  ----> //




    // <---- create post failed alert  ----> //


function creatPostFailedAlert(){
    const alertPlaceholder = document.getElementById('createPostFailed')
    
    const alert = (message, type) => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-danger alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
      ].join('')
    
      alertPlaceholder.append(wrapper)
    }
        alert("(API PROBLEM) Sorry ! You can't create a new post , Try later")
        //hide this alert after 2seconds
        setTimeout(()=>{
            const alertClose = bootstrap.Alert.getOrCreateInstance('#createPostFailed')
            alertClose.close()
        },6000)
    }
    // ----------------------------------------------------------------------------
    // <---- create post failed alert  ----> //


    //----------------------------------------------------------------------------
    // <---- Alerts  ----> //



// <---- Create new post  ----> //

function createNewPost(){

    let postId = document.getElementById("post-id-input").value
    let isCreate = postId == null || postId == ""
    

    const title = document.getElementById("postTitleInput").value
    const body = document.getElementById("postBodyInput").value
    const image = document.getElementById("postImg").files[0]
    const token = localStorage.getItem("token")

    let formData = new FormData() 
    formData.append("body",body)
    formData.append("title",title)
    formData.append("image",image)

    let url = ""
    
    const headers = {
        "Content-type":"multipart/form-data",
        "authorization": `Bearer ${token}`
    }

    if(isCreate)
    {
        url = `https://tarmeezacademy.com/api/v1/posts`
       
    }else{
        formData.append("_method","put")

        url = `https://tarmeezacademy.com/api/v1/posts/${postId}`
        
    }
    toggleLoader(true)
    axios.post(url , formData,{
        headers : headers
    })
    .then((response)=>{
        
        const modal = document.getElementById("addPostModal")
        const modalInstance = bootstrap.Modal.getInstance(modal)
        modalInstance.hide()
        location.reload();

    })
    .catch(error => {
        alert(error.response.data.message)
    }).finally(()=>{
        toggleLoader(false)
    })
    

}

// ------------------------------------------------------------------
// <---- Create new post  ----> //




// <---- get post details  ----> //

    
function getPostDetails(id) {
    // Check if we are on the index page before redirecting
    if (!window.location.href.includes("postDetails.html")) {
        window.location.href = `postDetails.html?postId=${id}`;
        return;
    }

    let postContainer = document.getElementById("post");
    if (!postContainer) return;  // Prevents error if element is missing

    let url = `https://tarmeezacademy.com/api/v1/posts/${id}`;
    toggleLoader(true)
    axios.get(url)
        .then((response) => {
            
            let post = response.data.data;
            const comments = post.comments
            const author = post.author


            postContainer.innerHTML = `
                <div class="card shadow-lg p-3 mb-5 rounded" style="width: 80%; margin: auto; margin-top: 50px;">
                <div class="d-flex align-items-center gap-3 p-2">
                    <img class="border border-primary" src="${author.profile_image}" alt=".." 
                        style="width: 40px;height: 40px; border-radius: 50%;">
                    <div class="fs-5 fw-medium">${author.name}</div>
                </div>
                
                <img src="${post.image}" class="card-img-top rounded" alt="..">
                <h6 class="text-secondary p-1">${post.created_at}</h6>
                
                <div class="card-body">
                    <h5 class="card-title">${post.title}</h5>
                    <p class="card-text">${post.body}</p>
                </div>

                <hr>

                <div class="d-flex align-items-center justify-content-between">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                            class="bi bi-chat-dots" viewBox="0 0 16 16">
                            <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                            <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15
                                c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 
                                10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362
                                a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8
                                c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0
                                -.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/>
                        </svg> 
                        (${post.comments_count}) comments
                    </span>
                    
                    
                    <!-- Post Tags -->
                    <div id="post-tags-${post.id}" class="d-flex gap-2"></div>
                </div>
                <div id="comments">
                        
                    </div>
                    <div class="hide input-group input-group-sm mb-3" id="add-comment-div">
                        <input class="form-control p-2" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" id="comment-input" type="text" placeholder="add your comment here..">
                        <button class="btn btn-outline-primary w-25" type="button" onclick="createCommentClicked()">send</button>
                    </div>
            </div>`
                
                
                for(comment of comments){
                    let commentsContent = `
                    <div class=" mb-2 rounded" style="background-color:rgba(128, 128, 128, 0.13);">
                    <div class="d-flex align-items-center gap-3 p-2">
                        <img class="border border-primary" src="${comment.author.profile_image}" alt=".." style="width: 40px;height: 40px; border-radius: 50%;">
                        <div class="fs-6 fw-medium">${comment.author.name}</div>
                    </div>
                    <div class="p-1" style="margin-left: 60px ; color:black ;margin-top: -16px ;">
                        ${comment.body}
                    </div>
                    </div>
                    `
                    document.getElementById("comments").innerHTML+= commentsContent
                }

              const currentPostTagsId = `post-tags-${post.id}`
              document.getElementById(currentPostTagsId).innerHTML= ""
              for(tag of post.tags){
                let tagsContent = `
                <button type="button" class="btn btn-sm btn-secondary" disabled>${tag.name}</button>
                `
                document.getElementById(currentPostTagsId).innerHTML+= tagsContent
              }
              
        })
        .catch(error => {
            alert(error.response.data.message)
        }).finally(()=>{
            toggleLoader(false)
        })
}

    //---------------------------------------------------------------------------------------------
    // <---- get post details  ----> //




    // <---- create comment  ----> //

function createCommentClicked(){
    let commentBody = document.getElementById("comment-input").value
    let params = {
        "body":commentBody
    }
    let token = localStorage.getItem("token")
    let url = `https://tarmeezacademy.com/api/v1/posts/${id}/comments`;
    toggleLoader(true)
    axios.post(url,params, {
        headers : {
            "authorization": `Bearer ${token}`
        }
    })
    .then((response)=>{
        
        console.log(response.data)
        getPostDetails(id)
    })
    .catch(error =>{
        alert(error.response.data.message)
    }).finally(()=>{
        toggleLoader(false)
    })
}
// -----------------------------------------------------------------------------------
// <---- Create comment  ----> //



// <---- Edit post  ----> //
function editPostBtnClicked(button) {
    
    let encodedPostData = button.getAttribute("data-post");
    let post = JSON.parse(decodeURIComponent(encodedPostData));

    document.getElementById("post-modal-title").innerHTML = "Edit post";
    document.getElementById("post-id-input").value = post.id;
    document.getElementById("postTitleInput").value = post.title || "";  // Prevent 'undefined'
    document.getElementById("postBodyInput").value = post.body || "";  // Prevent 'undefined'

    let postModal = new bootstrap.Modal(document.getElementById("addPostModal"), {});
    postModal.toggle();
}
//-------------------------------------------------------------------------------------
// <---- Edit post  ----> //



// <---- Delete post  ----> //

function deletePostBtnClicked(button) {
    let encodedPostData = button.getAttribute("data-post");
    let post = JSON.parse(decodeURIComponent(encodedPostData));

    document.getElementById("delete-post-id-input").value = post.id;

    let postModal = new bootstrap.Modal(document.getElementById("deletePostModal"), {});
    postModal.toggle();
}

function confirmPostDelete() {
    const postId = document.getElementById("delete-post-id-input").value;
    const token = localStorage.getItem("token");
    const headers = {
        "authorization": `Bearer ${token}`
    };

    let url = `https://tarmeezacademy.com/api/v1/posts/${postId}`;
    toggleLoader(true)
    axios.delete(url, { headers: headers })
        .then((response) => {
            
            const modal = document.getElementById("deletePostModal");
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            location.reload();
        })
        .catch(error => {
            console.error("Error deleting post:", error);
            alert(error.response?.data?.message || "An error occurred while deleting the post.");
        }).finally(()=>{
            toggleLoader(false)
        })
}

//-------------------------------------------------------------------------------------
// <---- Delete post  ----> //


// <---- AddBtnClicked  ----> //

function addBtnClicked() {
    document.getElementById("post-modal-title").innerHTML = "Edit post";
    document.getElementById("post-id-input").value = "";
    document.getElementById("postTitleInput").value = "" ;  
    document.getElementById("postBodyInput").value = "";  

    let postModal = new bootstrap.Modal(document.getElementById("addPostModal"), {});
    postModal.show();  // 🛠️ Use .show() instead of .toggle()
}
// -------------------------------------------------------------------------------------
// <---- AddBtnClicked  ----> //





// <---- current User  ----> //

function getCurrentUser(){
    let user = null
    const storageUser = localStorage.getItem("user")

    if(storageUser != null){
        user = JSON.parse(storageUser)
    }
    return user
}
// -------------------------------------------------------------------------------------
// <---- current User  ----> //



    // <---- Debuging  ----> //
    document.addEventListener("DOMContentLoaded", function () {
        if (document.getElementById("posts")) {
            getPosts();
        }
    
        if (window.location.href.includes("postDetails.html")) {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get("postId");
            if (postId) {
                getPostDetails(postId);
            }
        }
    });
    
    // ----------------------------------------------------------------------------------
    // <---- Debuging  ----> //


    // <---- get Current User  ----> //
    

    function getCurrentUserId(){
        const urlParams = new URLSearchParams(window.location.search)
        const id = urlParams.get("userid")
        return id
    }
    //--------------------------------------------------------------------------------
    // <---- get Current User  ----> //
    


// PROFILE PAGE //


getUser()
function getUser(){
    const id = getCurrentUserId()
    let url = `https://tarmeezacademy.com/api/v1/users/${id}`
    toggleLoader(true)
    axios.get(url)
    .then((response)=>{
        
        const user =response.data.data
        document.getElementById("emailProfile").innerHTML=user.email
        document.getElementById("usernameProfile").innerHTML=user.username
        document.getElementById("nameProfile").innerHTML=user.name
        document.getElementById("posts-count").innerHTML=user.posts_count
        document.getElementById("comments-count").innerHTML=user.comments_count
        document.getElementById("header-image").src=user.profile_image
        document.getElementById("name-posts").innerHTML=user.name

    }).catch(error => {
        console.error(error);
        alert(error.response?.data?.message || "An error occurred while deleting the post.");
    }).finally(()=>{
        toggleLoader(false)
    })

}


// <---- Get posts 'PROFILE'  ----> //

function getProfilePosts(){
    const id = getCurrentUserId()
    let url = `https://tarmeezacademy.com/api/v1/users/${id}/posts`
    toggleLoader(true)
    axios.get(url)
    .then((response)=>{
        
        let posts = response.data.data

        document.getElementById("user-posts").innerHTML=""
        
        for (post of posts){
            let postsContainer = document.getElementById('user-posts');
            if (!postsContainer) return;  // Prevent error if element is missing

            // show or hide edit button
            let user = getCurrentUser()
            let isMyPost = user != null && post.author.id == user.id

            let editButtonContent = ""
            let deleteButtonContent = ""
            if (isMyPost) {
                editButtonContent = `<button class="btn btn-secondary" data-post="${encodeURIComponent(JSON.stringify(post))}" onclick="editPostBtnClicked(this)">Edit</button>`;
                deleteButtonContent = `<button class="btn btn-danger" data-post="${encodeURIComponent(JSON.stringify(post))}" onclick="deletePostBtnClicked(this)">Delete</button>`;
                
            }
            // ------ show or hide edit button

            postsContainer.innerHTML +=
            `<div class="card shadow-lg p-3 mb-5 rounded" style="width: 80%; margin: auto; margin-top: 50px;">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-3 p-2">
                        <img class="border border-primary" src="${post.author.profile_image}" alt=".." style="width: 40px;height: 40px; border-radius: 50%;">
                        <div class="fs-5 fw-medium" >${post.author.name}</div>
                    </div>
                    <div>
                        ${editButtonContent}
                        ${deleteButtonContent}
                    </div>
                </div>
                <img src="${post.image}" class="card-img-top rounded" alt="..">
                <h6 class="text-secondary p-1">${post.created_at}</h6>
                <div class="card-body card-body-home" onclick="getPostDetails(${post.id})">
                  <h5 class="card-title">${post.title}</h5>
                  <p class="card-text">${post.body}</p>
                  <hr>
                  <div>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16">
                            <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                            <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/>
                          </svg> (${post.comments_count}) comments 
                            <span id="post-tags-${post.id}"> 
                            </span>
                    </span>
                  </div>
                </div>
              </div>`
              const currentPostTagsId = `post-tags-${post.id}`
              document.getElementById(currentPostTagsId).innerHTML= ""
              for(tag of post.tags){
                let tagsContent = `
                <button type="button" class="btn btn-sm btn-secondary" disabled>${tag.name}</button>
                `
                document.getElementById(currentPostTagsId).innerHTML+= tagsContent
              }
        } 
    })
    .catch(error => {
        alert(error.response.data.message)
    }).finally(()=>{
        toggleLoader(false)
    })
}
getProfilePosts()

// ----------------------------------------------------------------------------------------------
// <---- Get posts 'PROFILE'  ----> //

// <---- PROFILE PAGE ----> //




// <---- user & profile clicked ----> //

function userClicked(userId){
    window.location = `profile.html?userid=${userId}`
}

function profileClicked(){
    const user = getCurrentUser()
    const userId = user.id
    window.location = `profile.html?userid=${userId}`
}
//------------------------------------------------------
// <---- user & profile clicked ----> //



// <---- LOADER ----> //

function toggleLoader(show = true){
    if(show){
        document.getElementById("loader").style.visibility = 'visible'
    }else{
        document.getElementById("loader").style.visibility = 'hidden'
    }
}

//------------------------------------------------------
// <---- LOADER ----> //



// <---- mode switch ----> //


    

//------------------------------------------------------
// <---- mode switch ----> //


// <---- Top Button ----> //


let topButton = document.getElementById('topButton');
window.onscroll=function(){
    if(scrollY >=300){
        topButton.style.display='block';
    }
    else{
        topButton.style.display='none';
    }
}

topButton.onclick=function(){
    scroll({
        top:0,
        behavior:"smooth"
    })
}

    

//------------------------------------------------------
// <---- Top Button ----> //