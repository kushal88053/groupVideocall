let form = document.getElementById("lobby__form");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form from submitting normally

  let inviteCode = e.target.room.value; // Get the value from the input named 'room'
  let displayName = localStorage.getItem("display_name");

  if (!displayName) {
    form.name.value = displayName;
  }
  console.log(inviteCode);

  // If no invite code is provided, generate a random one
  if (!inviteCode) {
    inviteCode = String(Math.floor(Math.random() * 10000));
  }

  // Redirect the user to the room page with the generated invite code as a query parameter
  window.location = `room.html?room=${inviteCode}`;
});
