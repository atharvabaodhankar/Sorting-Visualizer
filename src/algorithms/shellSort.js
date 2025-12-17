export const shellSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    const n = arr.length;
    let gap = Math.floor(n / 2);
    while (gap > 0) {
        setCurrentStep(`Sorting with gap size ${gap}`);
        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap) {
                setComparisons(c => c + 1);
                if (!await updateArray(arr, [j, j - gap], [], `gap-${gap}`)) return;
                if (arr[j - gap].value > temp.value) {
                    arr[j] = arr[j - gap];
                    setSwaps(s => s + 1);
                    j -= gap;
                } else { break; }
            }
            arr[j] = temp;
            if (!await updateArray(arr, [j], [], `gap-${gap}`)) return;
        }
        gap = Math.floor(gap / 2);
    }
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
};
