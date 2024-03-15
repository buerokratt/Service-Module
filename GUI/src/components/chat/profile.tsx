import { motion } from "framer-motion";
import styles from "./chat.module.scss";
import useTestServiceStore from "store/test-services.store";
import Buerokratt from "../../static/icons/buerokratt.svg";

const Profile = () => (
  <div className={styles.profile__wrapper}>
    <motion.div
      className={`${styles.profile}`}
      initial="initial"
      animate="animate"
      role="button"
      onClick={useTestServiceStore.getState().openChat}
    >
      <img
        src={Buerokratt}
        alt="Buerokratt logo"
        width={45}
        style={{ filter: "brightness(0) invert(1)", imageRendering: "auto" }}
        loading="eager"
      />
    </motion.div>
  </div>
);

export default Profile;
