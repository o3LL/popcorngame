import React, { useState, useEffect } from "react";


const Header = () => {


    return (
        <header className="md:mt-12 mt-4 relative">
            <img className='m-auto w-40 md:w-80 md:mt-4' id='popcornLogo' src=".\img\Logo_Popcorn blanc.png" alt="logo popcorn blanc" />
            <div className="absolute z-1 -right-[75px] -bottom-[75px]">
                <img src="/img/svg (1).svg" alt="Games SVG" className="md:w-60 w-30" />

            </div>

        </header>
    );
};

export default Header;