import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import axios from 'axios'

export function attempts_Number(result){
    return result.filter(r => r !== undefined).length;
}

export function earnPoints_Number(result, answers, point){
    return result.map((element, i) => answers[i] === element).filter(i => i).map(i => point).reduce((prev, curr) => prev + curr, 0);
}

export function flagResult(totalPoints, earnPoints){
    return (totalPoints * 50 / 100) < earnPoints; /** earn 50% marks */
}

/** check user auth  */
export function CheckUserExist({ children }){
    const auth = useSelector(state => state.result.userId)
    return auth ? children : <Navigate to={'/'} replace={true}></Navigate>
}

/** get server data */
export const getServerData = async (url, callback) => {
  try {
    // Sử dụng đường dẫn tương đối để proxy sẽ xử lý
    // Kiểm tra nếu url đã có tiền tố /api/ thì không thêm nữa
    const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
    console.log('Fetching data from:', apiUrl);
    const response = await axios.get(apiUrl);
    if (callback) callback(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

/** post server data */
export const postServerData = async (url, result, callback) => {
  try {
    // Sử dụng đường dẫn tương đối để proxy sẽ xử lý
    // Kiểm tra nếu url đã có tiền tố /api/ thì không thêm nữa
    const apiUrl = url.startsWith('/api/') ? url : `/api/${url}`;
    console.log('Posting data to:', apiUrl);
    const response = await axios.post(apiUrl, result);
    if (callback) callback(response.data);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    return null;
  }
};