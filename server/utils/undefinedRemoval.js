exports.removeUndefined=(obj)=>{
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([_, value]) => value !== undefined && value !== null && value !== ''
        )
    );
}
