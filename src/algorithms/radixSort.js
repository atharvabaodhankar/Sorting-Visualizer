export const radixSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    
    const countingSort = async (arr, exp) => {
        const n = arr.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(arr[i].value / exp) % 10;
            count[digit]++;
        }
        for (let i = 1; i < 10; i++) { count[i] += count[i - 1]; }
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(arr[i].value / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
            setSwaps(s => s + 1);
        }
        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
            if (!await updateArray(arr, [i], [], `exp-${exp}`)) return;
        }
    };

    const max = Math.max(...arr.map(o => o.value));
    let exp = 1;
    while (Math.floor(max / exp) > 0) {
        setCurrentStep(`Sorting by digit at position ${exp}`);
        await countingSort(arr, exp);
        exp *= 10;
    }
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
};
