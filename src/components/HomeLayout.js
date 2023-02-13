import {debug} from "./config/debug";
import {NavLink, Outlet} from "react-router-dom";
import * as React from "react";

export const HomeLayout = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <Layout>`);
  }

  const style = ({ isActive }) => ({
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
      <div style={{
        // border:"1px dashed blue",
      }}>
        {/* nav bar */}
        <nav style={{paddingBottom: '1rem', paddingLeft: "1rem",
          display: "flex", flexDirection:"row", gap:"10px", justifyContent: "center"
        }}
        >
          <NavLink to="/" style={style}>
            Read
          </NavLink>
          <NavLink to="/table" style={style}>
            Table
          </NavLink>
        </nav>

        {/* Contents for selected nav*/}
        <main style={{ padding: '1rem 0' }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center"
          }}
          >
            <Outlet />
          </div>
        </main>
      </div>
  );
};