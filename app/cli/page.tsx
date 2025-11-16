'use client';

import { useState, useRef } from 'react';
import { add_device } from '@/actions/add_device';

export default function Page() {
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']); // State for each input box
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]); // Array of refs to input elements

    // Type the event as React.ChangeEvent<HTMLInputElement> and index as number
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newCode = [...code];
        newCode[index] = e.target.value.toUpperCase(); // Update the state with the new value

        setCode(newCode);

        // Move focus to the next input if the current one is filled
        if (e.target.value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    // Type the event as React.ClipboardEvent<HTMLInputElement> and index as number
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        const pastedData = e.clipboardData.getData('text').toUpperCase();
        const newCode = [...code];

        for (let i = 0; i < pastedData.length; i++) {
            if (index + i < 6) {
                newCode[index + i] = pastedData[i];
            }
        }

        setCode(newCode);

        // Move focus to the next input after pasting
        if (pastedData.length && index + pastedData.length < 6) {
            inputsRef.current[index + pastedData.length]?.focus();
        }
    };

    const combinedCode = code.join(''); // Combine the code into one string

    return (
        <>
            <div className="p-10">
                <span className="text-3xl">gild cli login</span>
                <br /><br />
                enter the code you see in the terminal
                <br /><br />
                <div className="w-[70%] m-auto text-center">
                    <form action={add_device} method="POST">
                        <div className="mb-4">
                            {code.map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1} // maxLength as a number
                                    value={code[index]}
                                    onChange={(e) => handleChange(e, index)}
                                    onPaste={(e) => handlePaste(e, index)}
                                    ref={(el) => { inputsRef.current[index] = el; }} // Ensure ref function returns void
                                    className="shadow appearance-none border rounded w-10 md:w-12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mx-1"
                                />
                            ))}
                        </div>
                        {/* Hidden input to store the combined code */}
                        <input type="hidden" name="device_code" value={combinedCode} />
                        <br />
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Approve Login</button>
                        <br /><br />
                    </form>
                    <br />
                    <span className="text-sm">you will be able to manage a list of authorized clients in your <strong>settings</strong></span>
                    <br />
                </div>
            </div>
        </>
    );
}