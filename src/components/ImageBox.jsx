import "./ImageBox.css"

import skyImage from "../assets/sky.jpg"


export default function ImageBox() {
    return (
        <div className="image-box">
            <img src={skyImage} alt="" />
        </div>
    )
}