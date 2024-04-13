function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function sendEmail(){
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value
    }),
  })
  .then(response=>{
    if (!response.ok) { 
      return response.json().then(data =>{
        alert(data.error);
        throw new Error(`Status code:${response.status}\n${data.error}`);
      })
    }
    return response.json();
  })
  // .then(response => {
  //   if (!response.ok) {
  //       if (response.status === 400) {
  //         return response.json().then(data => {
  //             alert(data.error);
  //             throw new Error(`HTTP error! Status: ${response.status}\n${data.error}`);
  //         });
  //     } else {
  //           throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //   }
  //   return response.json() })
  
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent'); 
  })
  .catch(error => {
    console.log(error.message);
  });
}
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response=>response.json())
  .then (data => {data.forEach(element => {
    // create mail element
    readStyle=""
    if (element.read===true) {readStyle="read";}
    var usernameOnTheLeft=element.sender;
    if (mailbox==='sent') {usernameOnTheLeft=`To: ${element.recipients}`}
    let mail=document.createElement('div');
    mail.className=`message ${mailbox} ${readStyle}`;
    mail.innerHTML= `
    <span><strong>${usernameOnTheLeft}</strong> Subject: ${element.subject}</span>
    <span class="right"><span>${element.timestamp}</span></span>`;
    mail.addEventListener('click', function() {
  viewEmail(element.id,mailbox);});
    document.querySelector("#emails-view").append(mail);
    if (mailbox!=="sent"){
    let archiveBut=document.createElement("button");
    archiveBut.innerHTML= element.archived ? "unarchive" : "archive";
    archiveBut.className="archiveButton";
    archiveBut.onclick=(event)=>{event.stopPropagation();updateArchive(element.id,element.archived)}
    mail.querySelector(".right").appendChild(archiveBut);}
  

    // <div class="col-lg-9 left"><strong>${element.sender}</strong> Subject: ${element.subject}</div>
    // <div class="col-lg-3 right">${element.timestamp}</div>`;
    // document.querySelector("#emails-view").append(mail);
    
  });})
}

function viewEmail(mailId,mailbox) {
  console.log('This element has been clicked!!!' + mailId);
  fetch (`/emails/${mailId}`)
  .then(response=>{
    if (!response.ok) { 
      return response.json().then(data =>{
        alert(data.error);
        throw new Error(`Status code:${response.status}\n${data.error}`);
      })
    }
    return response.json()})
  .then(data=>{
    console.log(data)
     document.querySelector('#emails-view').innerHTML='';
     let message=document.createElement('div');
     message.className='divvv';
     let sender_h1=` <p class="sender"><strong>From:</strong> ${data.sender}</p>`;
     let recipients=` <h6>To: ${data.recipients}</h6>`;
     let subject=`<p><strong>Subject:</strong> ${data.subject}</p>`;
     let body=`Message:<br/><p>${data.body}</p>`;
     let time=`<div class="time">${data.timestamp}</div>`;
     message.innerHTML=`${sender_h1}${subject}${recipients}<hr/>${body}${time}`;
     document.querySelector("#emails-view").append(message);
    //  idea to add buttons
    if (mailbox!=="sent"){let archive=document.createElement('button');
    archive.className="archiveButton";
    archive.innerHTML='archive';
    if (data.archived===true) {archive.innerHTML="unarchive"};
    archive.onclick=function() {updateArchive(data.id,data.archived);}
    document.querySelector('.sender').append(archive);
     let replyButton=document.createElement("button");
     replyButton.className="reply";
     replyButton.innerHTML="Reply";
     replyBody=`on ${data.timestamp}, ${data.sender} wrote:\n${data.body}\nMy response:\n`;
     replySubject= data.subject.includes("Re:") ? data.subject : `Re: ${data.subject}`;
     replyButton.onclick=()=>{reply_email(data.sender,replySubject,replyBody)};
     message.append(replyButton);}
    //  mark as read
     if (!data.read)
     {fetch(`/emails/${mailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })}
  })
  .catch(error => {
    console.log(error.message);
  });
}
function reply_email(recipient,subject,body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
}
function updateArchive(mailId,archivedd) {
  reverseArchivedd=!archivedd;
  console.log(mailId,reverseArchivedd);
  fetch (`/emails/${mailId}`,{
    method:'PUT',
    body: JSON.stringify({
      archived: reverseArchivedd
    })
  })
  .then(response=>{
    if (response.ok) {
      load_mailbox("inbox");
    }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector("#compose-form").onsubmit=(event)=> {
    event.preventDefault();
    sendEmail();
  };
});

