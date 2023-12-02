import { bottombarLinks } from '@/constants';
import { useLocation,Link } from 'react-router-dom'

const BottomBar = () => {

  const {pathname} = useLocation();


  return (
    <section className="bottom-bar ">
      {bottombarLinks.map((link, index) => {
        const isActive = pathname === link.route;

        return (
         
            <Link to={link.route} key={index}
            className={`${isActive && "bg-primary-500"} bottombar-link group rounded-[10px] flex-center flex-col gap-1 p-3 transition`}>
              <img
                src={link.imgURL}
                alt={link.label}
                width={16}
                height={16}
                className={`group-hover:invert-white ${
                  isActive && "invert-white"
                }`}
              />
              <p className="tiny-medium text-light-2">{link.label}</p>
            </Link>
          
        );
      })}
    </section>
  );
}

export default BottomBar