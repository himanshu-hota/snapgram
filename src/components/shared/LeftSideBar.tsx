import React from 'react'
import { Link } from 'react-router-dom';

const LeftSideBar = () => {
  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to={"/"} className="flex gap-3 items-center ">
          <img
            src="/assets/images/logo.svg "
            alt="Snapgram-logo"
            height={325}
            width={130}
          />
        </Link>
      </div>
    </nav>
  );
}

export default LeftSideBar