import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { setUserId } from '../redux/result_reducer'
import '../styles/Main.css'

export default function Main() {

    const inputRef = useRef(null)
    const dispatch = useDispatch()


    function startQuiz(){
        if(inputRef.current?.value){
            dispatch(setUserId(inputRef.current?.value))
        }
    }

  return (
    <div className='container'>
        <h1 className='title text-light'>English Quizzi</h1>

        <ol>
            <li>Bạn sẽ được hỏi 10 câu hỏi liên tiếp.</li>
            <li>Mỗi câu trả lời đúng được 10 điểm.</li>
            <li>Khi ấn vào phần nghe bộ lọc ngẫu nhiên sẽ được áp dụng </li>
            <li>Mỗi câu hỏi có 3 lựa chọn. Bạn chỉ được chọn một đáp án.</li>
            <li>Bạn có thể xem lại và thay đổi câu trả lời trước khi kết thúc bài quiz.</li>
            <li>Kết quả sẽ được hiển thị ở cuối bài quiz.</li>
            <li>Good Luck!</li>
        </ol>

        <form id="form">
            <input ref={inputRef} className="userid" type="text" placeholder='Username*' />
        </form>

        <div className='start'>
            <Link className='btn' to={'quiz'} onClick={startQuiz}>Start Quiz</Link>
        </div>

    </div>
  )
}
