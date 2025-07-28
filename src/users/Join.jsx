import React from 'react';

function Join() {
  return (
    <main>
      <h2>회원가입</h2>
      <form>
        <div>
          <label for="userId">ID</label><br />
          <input type="text" id="userId" name="userId" required />
        </div>
        <div>
          <label for="password">Password</label><br />
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label for="passwordCheck">Password Check</label><br />
          <input type="password" id="passwordCheck" name="passwordCheck" required />
        </div>
        <div>
          <label for="nickname">닉네임</label><br />
          <input type="text" id="nickname" name="nickname" required />
        </div>
        <div>
          <label for="email">Email</label><br />
          <input type="email" id="email" name="email" required />
        </div>
        <button type="submit">회원가입</button>
      </form>
    </main>
  );
}

export default Join;